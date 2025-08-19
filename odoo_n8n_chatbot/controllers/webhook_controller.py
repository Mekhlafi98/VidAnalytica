import json
import logging
import hashlib
import hmac
from datetime import datetime, timedelta
from odoo import http, fields
from odoo.http import request
from odoo.exceptions import AccessDenied, ValidationError

_logger = logging.getLogger(__name__)


class N8nWebhookController(http.Controller):
    
    @http.route('/n8n/webhook/callback/<int:workflow_id>', type='json', auth='none', methods=['POST'], csrf=False)
    def webhook_callback(self, workflow_id, **kwargs):
        """
        Handle webhook callbacks from n8n workflows
        """
        try:
            # Security checks
            if not self._validate_webhook_security():
                _logger.warning("Webhook security validation failed")
                return {'error': 'Unauthorized', 'status': 401}
            
            # Get workflow
            workflow = request.env['n8n.workflow'].sudo().browse(workflow_id)
            if not workflow.exists():
                _logger.error(f"Workflow {workflow_id} not found")
                return {'error': 'Workflow not found', 'status': 404}
            
            # Get callback data
            callback_data = request.jsonrequest
            _logger.info(f"Received callback for workflow {workflow_id}: {callback_data}")
            
            # Process callback
            success = self._process_workflow_callback(workflow, callback_data)
            
            if success:
                return {'status': 'success', 'message': 'Callback processed successfully'}
            else:
                return {'status': 'error', 'message': 'Failed to process callback'}
                
        except Exception as e:
            _logger.error(f"Error processing webhook callback: {e}")
            return {'error': str(e), 'status': 500}
    
    @http.route('/n8n/webhook/test', type='json', auth='user', methods=['POST'])
    def test_webhook(self, **kwargs):
        """
        Test webhook endpoint for development
        """
        try:
            data = request.jsonrequest
            _logger.info(f"Test webhook received: {data}")
            
            return {
                'status': 'success',
                'message': 'Test webhook received successfully',
                'received_data': data,
                'timestamp': datetime.now().isoformat()
            }
            
        except Exception as e:
            _logger.error(f"Error in test webhook: {e}")
            return {'error': str(e), 'status': 500}
    
    @http.route('/n8n/webhook/status/<int:workflow_id>', type='http', auth='user', methods=['GET'])
    def workflow_status(self, workflow_id, **kwargs):
        """
        Get workflow execution status
        """
        try:
            workflow = request.env['n8n.workflow'].browse(workflow_id)
            if not workflow.exists():
                return request.make_response(
                    json.dumps({'error': 'Workflow not found'}),
                    headers=[('Content-Type', 'application/json')],
                    status=404
                )
            
            # Get recent execution logs
            logs = request.env['n8n.execution.log'].search([
                ('workflow_id', '=', workflow_id)
            ], order='create_date desc', limit=10)
            
            status_data = {
                'workflow_id': workflow_id,
                'workflow_name': workflow.name,
                'active': workflow.active,
                'execution_count': workflow.execution_count,
                'success_rate': workflow.success_rate,
                'last_execution': workflow.last_execution.isoformat() if workflow.last_execution else None,
                'recent_executions': []
            }
            
            for log in logs:
                status_data['recent_executions'].append({
                    'id': log.id,
                    'status': log.status,
                    'created': log.create_date.isoformat(),
                    'user': log.user_name,
                    'message': log.message_body[:100] + '...' if len(log.message_body) > 100 else log.message_body
                })
            
            return request.make_response(
                json.dumps(status_data),
                headers=[('Content-Type', 'application/json')]
            )
            
        except Exception as e:
            _logger.error(f"Error getting workflow status: {e}")
            return request.make_response(
                json.dumps({'error': str(e)}),
                headers=[('Content-Type', 'application/json')],
                status=500
            )
    
    @http.route('/n8n/webhook/logs', type='http', auth='user', methods=['GET'])
    def execution_logs(self, **kwargs):
        """
        Get execution logs with filtering
        """
        try:
            # Parse query parameters
            workflow_id = kwargs.get('workflow_id')
            status = kwargs.get('status')
            user_id = kwargs.get('user_id')
            limit = int(kwargs.get('limit', 50))
            offset = int(kwargs.get('offset', 0))
            
            # Build domain
            domain = []
            if workflow_id:
                domain.append(('workflow_id', '=', int(workflow_id)))
            if status:
                domain.append(('status', '=', status))
            if user_id:
                domain.append(('user_id', '=', int(user_id)))
            
            # Search logs
            logs = request.env['n8n.execution.log'].search(
                domain,
                order='create_date desc',
                limit=limit,
                offset=offset
            )
            
            # Format response
            log_data = []
            for log in logs:
                log_data.append({
                    'id': log.id,
                    'workflow_id': log.workflow_id.id,
                    'workflow_name': log.workflow_name,
                    'user_id': log.user_id.id,
                    'user_name': log.user_name,
                    'status': log.status,
                    'message_body': log.message_body,
                    'created': log.create_date.isoformat(),
                    'execution_time_ms': log.execution_time_ms,
                    'error_message': log.error_message,
                    'retry_count': log.retry_count,
                })
            
            response_data = {
                'logs': log_data,
                'total_count': len(logs),
                'limit': limit,
                'offset': offset
            }
            
            return request.make_response(
                json.dumps(response_data),
                headers=[('Content-Type', 'application/json')]
            )
            
        except Exception as e:
            _logger.error(f"Error getting execution logs: {e}")
            return request.make_response(
                json.dumps({'error': str(e)}),
                headers=[('Content-Type', 'application/json')],
                status=500
            )
    
    @http.route('/n8n/webhook/trigger/<int:workflow_id>', type='json', auth='user', methods=['POST'])
    def manual_trigger(self, workflow_id, **kwargs):
        """
        Manually trigger a workflow (for testing)
        """
        try:
            workflow = request.env['n8n.workflow'].browse(workflow_id)
            if not workflow.exists():
                return {'error': 'Workflow not found', 'status': 404}
            
            # Check permissions
            if not workflow._check_user_permissions(request.env.user):
                return {'error': 'Permission denied', 'status': 403}
            
            # Get test data
            data = request.jsonrequest
            message_body = data.get('message', 'Manual trigger test')
            variables = data.get('variables', {})
            
            # Trigger workflow
            result = workflow.trigger_workflow(
                message_body=message_body,
                user=request.env.user,
                variables=variables
            )
            
            return {
                'status': 'success' if result['success'] else 'error',
                'message': 'Workflow triggered successfully' if result['success'] else result.get('error'),
                'log_id': result.get('log_id'),
                'result': result
            }
            
        except Exception as e:
            _logger.error(f"Error manually triggering workflow: {e}")
            return {'error': str(e), 'status': 500}
    
    def _validate_webhook_security(self):
        """
        Validate webhook security (IP restrictions, signatures, etc.)
        """
        try:
            # Check if security validation is enabled
            config = request.env['ir.config_parameter'].sudo()
            
            # IP Address validation
            allowed_ips = config.get_param('odoo_n8n_chatbot.allowed_ips', '')
            if allowed_ips:
                client_ip = request.httprequest.environ.get('REMOTE_ADDR')
                allowed_ip_list = [ip.strip() for ip in allowed_ips.split(',')]
                
                if client_ip not in allowed_ip_list:
                    _logger.warning(f"Webhook from unauthorized IP: {client_ip}")
                    return False
            
            # Signature validation
            webhook_secret = config.get_param('odoo_n8n_chatbot.webhook_secret', '')
            if webhook_secret:
                signature = request.httprequest.headers.get('X-N8n-Signature')
                if not signature:
                    _logger.warning("Missing webhook signature")
                    return False
                
                # Calculate expected signature
                body = request.httprequest.get_data()
                expected_signature = hmac.new(
                    webhook_secret.encode('utf-8'),
                    body,
                    hashlib.sha256
                ).hexdigest()
                
                if not hmac.compare_digest(signature, f"sha256={expected_signature}"):
                    _logger.warning("Invalid webhook signature")
                    return False
            
            return True
            
        except Exception as e:
            _logger.error(f"Error validating webhook security: {e}")
            return False
    
    def _process_workflow_callback(self, workflow, callback_data):
        """
        Process the workflow callback
        """
        try:
            # Find the most recent pending execution
            execution_log = request.env['n8n.execution.log'].sudo().search([
                ('workflow_id', '=', workflow.id),
                ('status', 'in', ['pending', 'pending_callback'])
            ], order='create_date desc', limit=1)
            
            if not execution_log:
                _logger.warning(f"No pending execution found for workflow {workflow.id}")
                # Still process the callback but don't update log
                return self._handle_callback_without_log(workflow, callback_data)
            
            # Calculate execution time
            execution_time = None
            if execution_log.create_date:
                time_diff = datetime.now() - execution_log.create_date
                execution_time = int(time_diff.total_seconds() * 1000)  # Convert to milliseconds
            
            # Determine status from callback data
            status = 'success'
            error_message = None
            
            if isinstance(callback_data, dict):
                if callback_data.get('error'):
                    status = 'error'
                    error_message = str(callback_data['error'])
                elif callback_data.get('status') == 'error':
                    status = 'error'
                    error_message = callback_data.get('message', 'Unknown error')
            
            # Update execution log
            update_vals = {
                'status': status,
                'callback_data': json.dumps(callback_data),
                'callback_received_at': fields.Datetime.now(),
            }
            
            if execution_time:
                update_vals['execution_time_ms'] = execution_time
            
            if error_message:
                update_vals['error_message'] = error_message
            
            execution_log.write(update_vals)
            
            # Handle the callback response
            self._handle_callback_response(execution_log, callback_data)
            
            return True
            
        except Exception as e:
            _logger.error(f"Error processing workflow callback: {e}")
            return False
    
    def _handle_callback_without_log(self, workflow, callback_data):
        """
        Handle callback when no execution log is found
        """
        try:
            _logger.info(f"Processing callback without log for workflow {workflow.name}: {callback_data}")
            # You could implement additional logic here
            # For example, creating a new log entry or sending a notification
            return True
        except Exception as e:
            _logger.error(f"Error handling callback without log: {e}")
            return False
    
    def _handle_callback_response(self, execution_log, callback_data):
        """
        Handle sending the callback response back to the user
        """
        try:
            # Use the chatbot model to handle the callback
            mail_bot = request.env['mail.bot'].sudo()
            mail_bot.handle_workflow_callback(execution_log.workflow_id.id, callback_data)
            
        except Exception as e:
            _logger.error(f"Error handling callback response: {e}")
    
    @http.route('/n8n/health', type='http', auth='none', methods=['GET'])
    def health_check(self):
        """
        Health check endpoint
        """
        try:
            return request.make_response(
                json.dumps({
                    'status': 'healthy',
                    'timestamp': datetime.now().isoformat(),
                    'version': '1.0.0'
                }),
                headers=[('Content-Type', 'application/json')]
            )
        except Exception as e:
            return request.make_response(
                json.dumps({
                    'status': 'error',
                    'error': str(e)
                }),
                headers=[('Content-Type', 'application/json')],
                status=500
            )