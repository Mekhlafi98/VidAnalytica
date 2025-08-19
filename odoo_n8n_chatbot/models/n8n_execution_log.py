import json
from odoo import models, fields, api, _


class N8nExecutionLog(models.Model):
    _name = 'n8n.execution.log'
    _description = 'n8n Workflow Execution Log'
    _order = 'create_date desc'
    _rec_name = 'display_name'

    display_name = fields.Char(
        string='Display Name',
        compute='_compute_display_name',
        store=True
    )
    
    # Workflow Information
    workflow_id = fields.Many2one(
        'n8n.workflow',
        string='Workflow',
        required=True,
        ondelete='cascade',
        index=True
    )
    workflow_name = fields.Char(
        related='workflow_id.name',
        string='Workflow Name',
        store=True
    )
    
    # User Information
    user_id = fields.Many2one(
        'res.users',
        string='Triggered By',
        required=True,
        index=True
    )
    user_name = fields.Char(
        related='user_id.name',
        string='User Name',
        store=True
    )
    
    # Execution Details
    message_body = fields.Text(
        string='Original Message',
        required=True
    )
    payload = fields.Text(
        string='Sent Payload',
        help="JSON payload sent to n8n"
    )
    status = fields.Selection([
        ('pending', 'Pending'),
        ('pending_callback', 'Pending Callback'),
        ('success', 'Success'),
        ('error', 'Error'),
        ('timeout', 'Timeout'),
        ('cancelled', 'Cancelled')
    ], string='Status', default='pending', required=True, index=True)
    
    # Response Data
    response_data = fields.Text(
        string='Response Data',
        help="Response received from n8n"
    )
    callback_data = fields.Text(
        string='Callback Data',
        help="Data received via callback"
    )
    http_status_code = fields.Integer(
        string='HTTP Status Code'
    )
    
    # Error Handling
    error_message = fields.Text(
        string='Error Message'
    )
    retry_count = fields.Integer(
        string='Retry Count',
        default=0
    )
    
    # Timing
    execution_time_ms = fields.Integer(
        string='Execution Time (ms)',
        help="Time taken for workflow execution"
    )
    callback_received_at = fields.Datetime(
        string='Callback Received At'
    )
    
    # Additional Context
    channel_info = fields.Text(
        string='Channel Info',
        help="Information about the chat channel"
    )
    extracted_variables = fields.Text(
        string='Extracted Variables',
        help="Variables extracted from the message"
    )
    
    @api.depends('workflow_id', 'user_id', 'create_date')
    def _compute_display_name(self):
        for record in self:
            if record.workflow_id and record.user_id:
                record.display_name = f"{record.workflow_name} - {record.user_name} - {record.create_date.strftime('%Y-%m-%d %H:%M')}"
            else:
                record.display_name = f"Log #{record.id}"
    
    def get_formatted_payload(self):
        """
        Return formatted JSON payload for display
        """
        self.ensure_one()
        if self.payload:
            try:
                return json.dumps(json.loads(self.payload), indent=2)
            except json.JSONDecodeError:
                return self.payload
        return ""
    
    def get_formatted_response(self):
        """
        Return formatted JSON response for display
        """
        self.ensure_one()
        if self.response_data:
            try:
                return json.dumps(json.loads(self.response_data), indent=2)
            except json.JSONDecodeError:
                return self.response_data
        return ""
    
    def get_formatted_callback(self):
        """
        Return formatted JSON callback data for display
        """
        self.ensure_one()
        if self.callback_data:
            try:
                return json.dumps(json.loads(self.callback_data), indent=2)
            except json.JSONDecodeError:
                return self.callback_data
        return ""
    
    def retry_execution(self):
        """
        Retry failed workflow execution
        """
        self.ensure_one()
        
        if self.status not in ['error', 'timeout']:
            return {
                'type': 'ir.actions.client',
                'tag': 'display_notification',
                'params': {
                    'title': _('Cannot Retry'),
                    'message': _('Only failed or timed-out executions can be retried'),
                    'type': 'warning',
                }
            }
        
        # Parse original payload
        try:
            payload_data = json.loads(self.payload) if self.payload else {}
        except json.JSONDecodeError:
            payload_data = {}
        
        # Extract variables if available
        variables = {}
        if self.extracted_variables:
            try:
                variables = json.loads(self.extracted_variables)
            except json.JSONDecodeError:
                pass
        
        # Trigger workflow again
        result = self.workflow_id.trigger_workflow(
            message_body=self.message_body,
            user=self.user_id,
            variables=variables
        )
        
        # Update retry count
        self.retry_count += 1
        
        if result['success']:
            return {
                'type': 'ir.actions.client',
                'tag': 'display_notification',
                'params': {
                    'title': _('Retry Successful'),
                    'message': _('Workflow has been re-triggered successfully'),
                    'type': 'success',
                }
            }
        else:
            return {
                'type': 'ir.actions.client',
                'tag': 'display_notification',
                'params': {
                    'title': _('Retry Failed'),
                    'message': result.get('error', 'Unknown error'),
                    'type': 'danger',
                }
            }
    
    def action_view_workflow(self):
        """
        Open the related workflow
        """
        self.ensure_one()
        return {
            'type': 'ir.actions.act_window',
            'res_model': 'n8n.workflow',
            'res_id': self.workflow_id.id,
            'view_mode': 'form',
            'target': 'current',
        }
    
    @api.model
    def cleanup_old_logs(self, days=30):
        """
        Clean up old execution logs
        """
        cutoff_date = fields.Datetime.now() - timedelta(days=days)
        old_logs = self.search([('create_date', '<', cutoff_date)])
        count = len(old_logs)
        old_logs.unlink()
        return count