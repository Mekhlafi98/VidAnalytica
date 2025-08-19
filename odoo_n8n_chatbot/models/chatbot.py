import logging
import json
from odoo import models, api, _

_logger = logging.getLogger(__name__)


class MailBot(models.AbstractModel):
    _inherit = 'mail.bot'

    @api.model
    def _answer_to_message(self, record, values, command=False):
        """
        Override the chatbot's message handling to detect and trigger n8n workflows
        """
        # Get the original response first
        original_response = super()._answer_to_message(record, values, command)
        
        # Extract message details
        message_body = values.get('body', '').strip()
        author_id = values.get('author_id')
        
        if not message_body or not author_id:
            return original_response
        
        # Get the user who sent the message
        user = self.env['res.users'].browse(author_id)
        if not user.exists():
            return original_response
        
        # Detect workflow triggers
        workflow_result = self._detect_workflow_trigger(message_body, user, record)
        
        if workflow_result:
            # If a workflow was triggered, return the workflow response instead
            return workflow_result
        
        # Return original chatbot response if no workflow was triggered
        return original_response
    
    def _detect_workflow_trigger(self, message_body, user, channel=None):
        """
        Detect if the message should trigger an n8n workflow
        """
        # Skip if n8n integration is disabled
        if not self._is_n8n_integration_enabled():
            return False
        
        # Get all active workflows ordered by sequence
        workflows = self.env['n8n.workflow'].search([
            ('active', '=', True)
        ], order='sequence, id')
        
        for workflow in workflows:
            try:
                matches, variables = workflow.matches_message(message_body, user)
                if matches:
                    _logger.info(f"Workflow '{workflow.name}' triggered by user {user.name}")
                    return self._trigger_n8n_workflow(workflow, message_body, user, channel, variables)
            except Exception as e:
                _logger.error(f"Error checking workflow {workflow.name}: {e}")
                continue
        
        return False
    
    def _trigger_n8n_workflow(self, workflow, message_body, user, channel=None, variables=None):
        """
        Trigger the n8n workflow and handle the response
        """
        try:
            # Trigger the workflow
            result = workflow.trigger_workflow(
                message_body=message_body,
                user=user,
                channel=channel,
                variables=variables
            )
            
            if result['success']:
                # Handle successful trigger
                response_text = self._format_workflow_response(workflow, result, variables)
                
                if workflow.expect_callback:
                    # If expecting callback, return a pending message
                    return self._create_pending_response(workflow, response_text)
                else:
                    # If not expecting callback, return immediate response
                    return self._create_immediate_response(workflow, response_text, result)
            else:
                # Handle workflow trigger failure
                error_msg = result.get('error', 'Unknown error occurred')
                _logger.error(f"Workflow {workflow.name} failed: {error_msg}")
                
                return self._create_error_response(workflow, error_msg)
                
        except Exception as e:
            _logger.error(f"Error triggering workflow {workflow.name}: {e}")
            return self._create_error_response(workflow, str(e))
    
    def _format_workflow_response(self, workflow, result, variables=None):
        """
        Format the workflow response using templates
        """
        if workflow.response_template:
            try:
                # Use template with variable substitution
                response_text = workflow.response_template.format(
                    workflow_name=workflow.name,
                    user_name=self.env.user.name,
                    **(variables or {})
                )
            except KeyError as e:
                _logger.warning(f"Template variable missing: {e}")
                response_text = workflow.response_template
        else:
            # Default response
            if workflow.expect_callback:
                response_text = _("Processing your request with '{}'... Please wait for the result.").format(workflow.name)
            else:
                response_text = _("Successfully triggered workflow '{}'.").format(workflow.name)
        
        return response_text
    
    def _create_pending_response(self, workflow, response_text):
        """
        Create a response for workflows that expect callbacks
        """
        return {
            'body': f"🔄 {response_text}",
            'message_type': 'comment',
            'subtype_xmlid': 'mail.mt_comment',
        }
    
    def _create_immediate_response(self, workflow, response_text, result):
        """
        Create an immediate response for workflows that don't expect callbacks
        """
        # Try to extract meaningful data from the result
        response_data = result.get('response', {})
        if isinstance(response_data, dict) and 'message' in response_data:
            response_text = response_data['message']
        
        return {
            'body': f"✅ {response_text}",
            'message_type': 'comment',
            'subtype_xmlid': 'mail.mt_comment',
        }
    
    def _create_error_response(self, workflow, error_message):
        """
        Create an error response
        """
        return {
            'body': f"❌ Error executing '{workflow.name}': {error_message}",
            'message_type': 'comment',
            'subtype_xmlid': 'mail.mt_comment',
        }
    
    def _is_n8n_integration_enabled(self):
        """
        Check if n8n integration is enabled in settings
        """
        return self.env['ir.config_parameter'].sudo().get_param(
            'odoo_n8n_chatbot.enable_integration', 
            default=True
        )
    
    @api.model
    def handle_workflow_callback(self, workflow_id, callback_data):
        """
        Handle callback from n8n workflow
        """
        try:
            workflow = self.env['n8n.workflow'].browse(workflow_id)
            if not workflow.exists():
                _logger.error(f"Workflow {workflow_id} not found for callback")
                return False
            
            # Find the most recent pending execution log
            execution_log = self.env['n8n.execution.log'].search([
                ('workflow_id', '=', workflow_id),
                ('status', 'in', ['pending', 'pending_callback'])
            ], order='create_date desc', limit=1)
            
            if not execution_log:
                _logger.warning(f"No pending execution found for workflow {workflow_id}")
                return False
            
            # Update execution log
            execution_log.write({
                'status': 'success',
                'callback_data': json.dumps(callback_data),
                'callback_received_at': fields.Datetime.now(),
            })
            
            # Format callback response
            response_text = self._format_callback_response(workflow, callback_data)
            
            # Send response back to the original channel/conversation
            self._send_callback_response(execution_log, response_text)
            
            return True
            
        except Exception as e:
            _logger.error(f"Error handling workflow callback: {e}")
            return False
    
    def _format_callback_response(self, workflow, callback_data):
        """
        Format the callback response
        """
        if isinstance(callback_data, dict):
            if 'message' in callback_data:
                return f"✅ {callback_data['message']}"
            elif 'result' in callback_data:
                return f"✅ Workflow completed: {callback_data['result']}"
            else:
                return f"✅ Workflow '{workflow.name}' completed successfully"
        else:
            return f"✅ Workflow '{workflow.name}' completed: {str(callback_data)}"
    
    def _send_callback_response(self, execution_log, response_text):
        """
        Send the callback response to the original conversation
        """
        try:
            # This is a simplified implementation
            # In a real scenario, you'd need to identify the original channel/conversation
            # and send the message there
            
            # For now, we'll log the response
            _logger.info(f"Callback response for execution {execution_log.id}: {response_text}")
            
            # You could implement logic here to:
            # 1. Find the original mail.channel or mail.thread
            # 2. Post the callback message there
            # 3. Notify the original user
            
        except Exception as e:
            _logger.error(f"Error sending callback response: {e}")


class MailChannel(models.Model):
    _inherit = 'mail.channel'
    
    def _notify_thread(self, message, msg_vals=False, **kwargs):
        """
        Override to handle n8n workflow responses in channels
        """
        # Call parent method first
        result = super()._notify_thread(message, msg_vals, **kwargs)
        
        # Additional logic for n8n integration could be added here
        # For example, storing channel context for workflow callbacks
        
        return result