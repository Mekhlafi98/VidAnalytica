import re
import json
import logging
from datetime import datetime
from odoo import models, fields, api, _
from odoo.exceptions import UserError, ValidationError

_logger = logging.getLogger(__name__)


class N8nWorkflow(models.Model):
    _name = 'n8n.workflow'
    _description = 'n8n Workflow Configuration'
    _order = 'sequence, name'
    _rec_name = 'display_name'

    name = fields.Char(
        string='Workflow Name',
        required=True,
        help="Internal name for the workflow"
    )
    display_name = fields.Char(
        string='Display Name',
        compute='_compute_display_name',
        store=True
    )
    description = fields.Text(
        string='Description',
        help="Description of what this workflow does"
    )
    active = fields.Boolean(
        string='Active',
        default=True,
        help="Inactive workflows will not be triggered"
    )
    sequence = fields.Integer(
        string='Sequence',
        default=10,
        help="Order of execution when multiple workflows match"
    )
    
    # Trigger Configuration
    trigger_keywords = fields.Text(
        string='Trigger Keywords',
        required=True,
        help="Keywords or phrases that trigger this workflow (one per line). "
             "Supports regex patterns when regex_mode is enabled."
    )
    regex_mode = fields.Boolean(
        string='Use Regex',
        default=False,
        help="Enable regex pattern matching for trigger keywords"
    )
    case_sensitive = fields.Boolean(
        string='Case Sensitive',
        default=False,
        help="Whether keyword matching should be case sensitive"
    )
    
    # n8n Configuration
    n8n_webhook_url = fields.Char(
        string='n8n Webhook URL',
        required=True,
        help="The webhook URL from n8n workflow"
    )
    n8n_api_key = fields.Char(
        string='n8n API Key',
        help="API key for authentication (optional)"
    )
    webhook_method = fields.Selection([
        ('POST', 'POST'),
        ('GET', 'GET'),
        ('PUT', 'PUT'),
        ('PATCH', 'PATCH')
    ], string='HTTP Method', default='POST', required=True)
    
    # Response Configuration
    callback_url = fields.Char(
        string='Callback URL',
        compute='_compute_callback_url',
        readonly=True,
        help="URL that n8n should call back with results"
    )
    expect_callback = fields.Boolean(
        string='Expect Callback',
        default=True,
        help="Whether this workflow will send a callback response"
    )
    timeout_seconds = fields.Integer(
        string='Timeout (seconds)',
        default=30,
        help="Maximum time to wait for workflow completion"
    )
    
    # Template Variables
    template_variables = fields.Text(
        string='Template Variables',
        help="JSON object defining variables to extract from messages. "
             "Example: {'customer_name': 'regex_pattern', 'amount': 'number'}"
    )
    
    # Security & Access
    allowed_user_ids = fields.Many2many(
        'res.users',
        string='Allowed Users',
        help="Users who can trigger this workflow. Leave empty for all users."
    )
    allowed_group_ids = fields.Many2many(
        'res.groups',
        string='Allowed Groups',
        help="Groups that can trigger this workflow"
    )
    
    # Logging & Monitoring
    log_executions = fields.Boolean(
        string='Log Executions',
        default=True,
        help="Log all workflow executions for monitoring"
    )
    execution_count = fields.Integer(
        string='Execution Count',
        compute='_compute_execution_stats',
        store=False
    )
    success_rate = fields.Float(
        string='Success Rate (%)',
        compute='_compute_execution_stats',
        store=False
    )
    last_execution = fields.Datetime(
        string='Last Execution',
        compute='_compute_execution_stats',
        store=False
    )
    
    # Multi-language Support
    response_template = fields.Text(
        string='Response Template',
        help="Template for bot responses. Use {variable_name} for substitution"
    )
    
    # Computed Fields
    @api.depends('name', 'description')
    def _compute_display_name(self):
        for record in self:
            if record.description:
                record.display_name = f"{record.name} - {record.description[:50]}"
            else:
                record.display_name = record.name
    
    @api.depends()
    def _compute_callback_url(self):
        base_url = self.env['ir.config_parameter'].sudo().get_param('web.base.url')
        for record in self:
            record.callback_url = f"{base_url}/n8n/webhook/callback/{record.id}"
    
    def _compute_execution_stats(self):
        for record in self:
            logs = self.env['n8n.execution.log'].search([('workflow_id', '=', record.id)])
            record.execution_count = len(logs)
            if logs:
                success_logs = logs.filtered(lambda l: l.status == 'success')
                record.success_rate = (len(success_logs) / len(logs)) * 100
                record.last_execution = max(logs.mapped('create_date'))
            else:
                record.success_rate = 0.0
                record.last_execution = False
    
    @api.constrains('trigger_keywords')
    def _check_trigger_keywords(self):
        for record in self:
            if not record.trigger_keywords.strip():
                raise ValidationError(_("Trigger keywords cannot be empty"))
            
            if record.regex_mode:
                # Validate regex patterns
                keywords = record.trigger_keywords.strip().split('\n')
                for keyword in keywords:
                    if keyword.strip():
                        try:
                            re.compile(keyword.strip())
                        except re.error as e:
                            raise ValidationError(
                                _("Invalid regex pattern '%s': %s") % (keyword.strip(), str(e))
                            )
    
    @api.constrains('template_variables')
    def _check_template_variables(self):
        for record in self:
            if record.template_variables:
                try:
                    json.loads(record.template_variables)
                except json.JSONDecodeError:
                    raise ValidationError(_("Template variables must be valid JSON"))
    
    def matches_message(self, message_body, user=None):
        """
        Check if a message matches this workflow's triggers
        """
        self.ensure_one()
        
        if not self.active:
            return False, {}
        
        # Check user permissions
        if not self._check_user_permissions(user):
            return False, {}
        
        # Check trigger keywords
        keywords = self.trigger_keywords.strip().split('\n')
        message = message_body if self.case_sensitive else message_body.lower()
        
        for keyword in keywords:
            keyword = keyword.strip()
            if not keyword:
                continue
                
            if not self.case_sensitive:
                keyword = keyword.lower()
            
            if self.regex_mode:
                try:
                    match = re.search(keyword, message)
                    if match:
                        variables = self._extract_template_variables(message_body, match)
                        return True, variables
                except re.error:
                    _logger.warning(f"Invalid regex pattern in workflow {self.name}: {keyword}")
                    continue
            else:
                if keyword in message:
                    variables = self._extract_template_variables(message_body)
                    return True, variables
        
        return False, {}
    
    def _check_user_permissions(self, user):
        """
        Check if user has permission to trigger this workflow
        """
        if not user:
            return False
        
        # If no specific users/groups are defined, allow all users
        if not self.allowed_user_ids and not self.allowed_group_ids:
            return True
        
        # Check specific users
        if self.allowed_user_ids and user in self.allowed_user_ids:
            return True
        
        # Check groups
        if self.allowed_group_ids:
            user_groups = user.groups_id
            if any(group in user_groups for group in self.allowed_group_ids):
                return True
        
        return False
    
    def _extract_template_variables(self, message_body, regex_match=None):
        """
        Extract template variables from message
        """
        variables = {}
        
        if not self.template_variables:
            return variables
        
        try:
            template_config = json.loads(self.template_variables)
            
            for var_name, pattern in template_config.items():
                if regex_match and hasattr(regex_match, 'groupdict'):
                    # Use named groups from regex match
                    if var_name in regex_match.groupdict():
                        variables[var_name] = regex_match.groupdict()[var_name]
                else:
                    # Use separate regex patterns
                    if isinstance(pattern, str):
                        match = re.search(pattern, message_body, re.IGNORECASE)
                        if match:
                            variables[var_name] = match.group(1) if match.groups() else match.group(0)
        
        except (json.JSONDecodeError, AttributeError) as e:
            _logger.warning(f"Error extracting template variables: {e}")
        
        return variables
    
    def trigger_workflow(self, message_body, user, channel=None, variables=None):
        """
        Trigger the n8n workflow
        """
        self.ensure_one()
        
        if not self.active:
            raise UserError(_("Workflow is not active"))
        
        # Prepare payload
        payload = {
            'message': message_body,
            'user_id': user.id,
            'user_name': user.name,
            'user_email': user.email,
            'timestamp': datetime.now().isoformat(),
            'workflow_id': self.id,
            'workflow_name': self.name,
            'variables': variables or {},
        }
        
        if channel:
            payload.update({
                'channel_id': channel.id,
                'channel_name': channel.name,
            })
        
        # Add callback URL if expected
        if self.expect_callback:
            payload['callback_url'] = self.callback_url
        
        # Log execution start
        log_vals = {
            'workflow_id': self.id,
            'user_id': user.id,
            'message_body': message_body,
            'payload': json.dumps(payload),
            'status': 'pending',
        }
        
        if self.log_executions:
            execution_log = self.env['n8n.execution.log'].create(log_vals)
        else:
            execution_log = None
        
        try:
            # Make the HTTP request to n8n
            import requests
            
            headers = {'Content-Type': 'application/json'}
            if self.n8n_api_key:
                headers['Authorization'] = f'Bearer {self.n8n_api_key}'
            
            response = requests.request(
                method=self.webhook_method,
                url=self.n8n_webhook_url,
                json=payload,
                headers=headers,
                timeout=self.timeout_seconds
            )
            
            response.raise_for_status()
            
            # Update log with success
            if execution_log:
                execution_log.write({
                    'status': 'success' if not self.expect_callback else 'pending_callback',
                    'response_data': response.text,
                    'http_status_code': response.status_code,
                })
            
            return {
                'success': True,
                'response': response.json() if response.content else {},
                'log_id': execution_log.id if execution_log else None,
            }
        
        except Exception as e:
            _logger.error(f"Error triggering n8n workflow {self.name}: {e}")
            
            if execution_log:
                execution_log.write({
                    'status': 'error',
                    'error_message': str(e),
                })
            
            return {
                'success': False,
                'error': str(e),
                'log_id': execution_log.id if execution_log else None,
            }
    
    def test_workflow(self):
        """
        Test the workflow with sample data
        """
        self.ensure_one()
        
        test_message = "Test workflow trigger"
        result = self.trigger_workflow(
            message_body=test_message,
            user=self.env.user,
            variables={'test': True}
        )
        
        if result['success']:
            return {
                'type': 'ir.actions.client',
                'tag': 'display_notification',
                'params': {
                    'title': _('Test Successful'),
                    'message': _('Workflow triggered successfully'),
                    'type': 'success',
                }
            }
        else:
            return {
                'type': 'ir.actions.client',
                'tag': 'display_notification',
                'params': {
                    'title': _('Test Failed'),
                    'message': result.get('error', 'Unknown error'),
                    'type': 'danger',
                }
            }