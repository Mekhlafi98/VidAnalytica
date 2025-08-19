from odoo import models, fields, api


class ResConfigSettings(models.TransientModel):
    _inherit = 'res.config.settings'

    # n8n Integration Settings
    n8n_integration_enabled = fields.Boolean(
        string='Enable n8n Integration',
        config_parameter='odoo_n8n_chatbot.enable_integration',
        default=True,
        help="Enable or disable n8n workflow integration with chatbot"
    )
    
    n8n_base_url = fields.Char(
        string='n8n Base URL',
        config_parameter='odoo_n8n_chatbot.base_url',
        help="Base URL of your n8n instance (e.g., https://n8n.example.com)"
    )
    
    n8n_global_api_key = fields.Char(
        string='Global n8n API Key',
        config_parameter='odoo_n8n_chatbot.global_api_key',
        help="Global API key for n8n authentication (can be overridden per workflow)"
    )
    
    # Webhook Security
    webhook_secret_key = fields.Char(
        string='Webhook Secret Key',
        config_parameter='odoo_n8n_chatbot.webhook_secret',
        help="Secret key for validating webhook callbacks from n8n"
    )
    
    webhook_allowed_ips = fields.Text(
        string='Allowed Webhook IPs',
        config_parameter='odoo_n8n_chatbot.allowed_ips',
        help="Comma-separated list of IP addresses allowed to send webhooks. Leave empty to allow all."
    )
    
    # Execution Settings
    default_timeout_seconds = fields.Integer(
        string='Default Timeout (seconds)',
        config_parameter='odoo_n8n_chatbot.default_timeout',
        default=30,
        help="Default timeout for workflow executions"
    )
    
    max_retry_attempts = fields.Integer(
        string='Max Retry Attempts',
        config_parameter='odoo_n8n_chatbot.max_retries',
        default=3,
        help="Maximum number of retry attempts for failed workflows"
    )
    
    # Logging Settings
    log_retention_days = fields.Integer(
        string='Log Retention (days)',
        config_parameter='odoo_n8n_chatbot.log_retention_days',
        default=30,
        help="Number of days to keep execution logs"
    )
    
    enable_debug_logging = fields.Boolean(
        string='Enable Debug Logging',
        config_parameter='odoo_n8n_chatbot.debug_logging',
        default=False,
        help="Enable detailed debug logging for troubleshooting"
    )
    
    # Rate Limiting
    enable_rate_limiting = fields.Boolean(
        string='Enable Rate Limiting',
        config_parameter='odoo_n8n_chatbot.rate_limiting',
        default=False,
        help="Enable rate limiting for workflow executions"
    )
    
    rate_limit_per_user = fields.Integer(
        string='Rate Limit (per user/minute)',
        config_parameter='odoo_n8n_chatbot.rate_limit_user',
        default=10,
        help="Maximum workflow executions per user per minute"
    )
    
    # UI Settings
    show_execution_stats = fields.Boolean(
        string='Show Execution Statistics',
        config_parameter='odoo_n8n_chatbot.show_stats',
        default=True,
        help="Show execution statistics in workflow views"
    )
    
    enable_workflow_dashboard = fields.Boolean(
        string='Enable Workflow Dashboard',
        config_parameter='odoo_n8n_chatbot.enable_dashboard',
        default=True,
        help="Enable the workflow monitoring dashboard"
    )
    
    @api.model
    def get_values(self):
        res = super().get_values()
        
        # Add any custom logic for retrieving values here
        
        return res
    
    def set_values(self):
        super().set_values()
        
        # Add any custom logic for setting values here
        # For example, clearing caches or triggering updates
        
        # Clear workflow cache when settings change
        self.env['n8n.workflow'].search([]).invalidate_cache()
    
    def test_n8n_connection(self):
        """
        Test connection to n8n instance
        """
        if not self.n8n_base_url:
            return {
                'type': 'ir.actions.client',
                'tag': 'display_notification',
                'params': {
                    'title': 'Missing Configuration',
                    'message': 'Please configure the n8n Base URL first',
                    'type': 'warning',
                }
            }
        
        try:
            import requests
            
            # Test basic connectivity
            test_url = f"{self.n8n_base_url.rstrip('/')}/healthz"
            headers = {}
            
            if self.n8n_global_api_key:
                headers['Authorization'] = f'Bearer {self.n8n_global_api_key}'
            
            response = requests.get(test_url, headers=headers, timeout=10)
            
            if response.status_code == 200:
                return {
                    'type': 'ir.actions.client',
                    'tag': 'display_notification',
                    'params': {
                        'title': 'Connection Successful',
                        'message': 'Successfully connected to n8n instance',
                        'type': 'success',
                    }
                }
            else:
                return {
                    'type': 'ir.actions.client',
                    'tag': 'display_notification',
                    'params': {
                        'title': 'Connection Failed',
                        'message': f'HTTP {response.status_code}: {response.text}',
                        'type': 'danger',
                    }
                }
        
        except Exception as e:
            return {
                'type': 'ir.actions.client',
                'tag': 'display_notification',
                'params': {
                    'title': 'Connection Error',
                    'message': str(e),
                    'type': 'danger',
                }
            }
    
    def cleanup_old_logs(self):
        """
        Manually trigger cleanup of old execution logs
        """
        try:
            count = self.env['n8n.execution.log'].cleanup_old_logs(self.log_retention_days)
            return {
                'type': 'ir.actions.client',
                'tag': 'display_notification',
                'params': {
                    'title': 'Cleanup Complete',
                    'message': f'Cleaned up {count} old execution logs',
                    'type': 'success',
                }
            }
        except Exception as e:
            return {
                'type': 'ir.actions.client',
                'tag': 'display_notification',
                'params': {
                    'title': 'Cleanup Failed',
                    'message': str(e),
                    'type': 'danger',
                }
            }