# Odoo n8n Chatbot Integration

[![License: LGPL-3](https://img.shields.io/badge/License-LGPL%20v3-blue.svg)](https://www.gnu.org/licenses/lgpl-3.0)
[![Odoo Version](https://img.shields.io/badge/Odoo-16.0-green.svg)](https://github.com/odoo/odoo/tree/16.0)
[![Python Version](https://img.shields.io/badge/Python-3.8%2B-blue.svg)](https://www.python.org/)

A powerful Odoo module that integrates n8n workflow automation with Odoo's chatbot system, enabling users to trigger complex workflows through natural language commands.

## 🚀 Features

### Core Functionality
- **Natural Language Processing**: Trigger workflows using conversational commands
- **Advanced Pattern Matching**: Support for regex patterns and template variables  
- **Webhook Integration**: Seamless n8n workflow triggering via webhooks
- **Callback Handling**: Process workflow responses and send them back to users
- **Error Recovery**: Automatic retry mechanisms and manual retry options

### Security & Access Control
- **Role-based Permissions**: Three-tier access control (User, Manager, Admin)
- **Webhook Security**: IP restrictions and signature validation
- **Record-level Security**: Fine-grained access control for workflows
- **Audit Trails**: Comprehensive logging of all workflow executions

### Monitoring & Analytics
- **Real-time Dashboard**: Monitor workflow performance and statistics
- **Execution Logs**: Detailed logging with filtering and search capabilities
- **Performance Metrics**: Success rates, response times, and trend analysis
- **Visual Analytics**: Charts and graphs for workflow insights

### Enterprise Features
- **Rate Limiting**: Prevent abuse with configurable rate limits
- **Template Variables**: Dynamic parameter extraction from messages
- **Multi-language Support**: Customizable response templates
- **Automated Cleanup**: Scheduled cleanup of old execution logs

## 📋 Prerequisites

### System Requirements
- **Odoo**: Version 16.0 or higher
- **Python**: 3.8 or higher
- **n8n**: Any version (Cloud or self-hosted)

### Python Dependencies
```bash
pip install requests validators
```

### Odoo Dependencies
- `base` - Core Odoo functionality
- `mail` - Email and messaging system
- `web` - Web interface components
- `contacts` - Contact management

## 🛠️ Installation

### 1. Download and Install Module

```bash
# Clone or download the module
cd /path/to/odoo/addons
git clone <repository-url> odoo_n8n_chatbot

# Or extract the ZIP file to your addons directory
```

### 2. Install Dependencies

```bash
pip install requests validators
```

### 3. Update Odoo Apps List

1. Go to **Apps** menu in Odoo
2. Click **Update Apps List**
3. Search for "n8n Integration"
4. Click **Install**

### 4. Configure Module

1. Go to **Settings** → **General Settings**
2. Find the **n8n Integration** section
3. Enable the integration and configure your n8n URL
4. Set up webhook security if needed

## ⚙️ Configuration

### Basic Setup

1. **Enable Integration**
   ```
   Settings → General Settings → n8n Integration
   ✓ Enable n8n Integration
   n8n Base URL: https://your-n8n-instance.com
   ```

2. **Create Your First Workflow**
   ```
   n8n Integration → Workflows → Create
   
   Name: Create Lead
   Trigger Keywords: 
   - create lead
   - new lead
   - add lead
   
   n8n Webhook URL: https://your-n8n-instance.com/webhook/create-lead
   ```

3. **Set Up n8n Workflow**
   - Create a new workflow in n8n
   - Add a Webhook trigger node
   - Configure the webhook URL to match your Odoo workflow
   - Add your automation logic
   - (Optional) Add HTTP Request node to send callback to Odoo

### Advanced Configuration

#### Regex Pattern Matching
```python
# Enable regex mode in workflow
Regex Mode: ✓ Enabled
Trigger Keywords: create lead for (?P<name>[A-Z][a-z]+ [A-Z][a-z]+)

Template Variables: {
  "customer_name": "(?P<customer_name>[A-Z][a-z]+ [A-Z][a-z]+)",
  "email": "(?P<email>[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,})"
}
```

#### Webhook Security
```python
# In Odoo settings
Webhook Secret Key: your-secret-key-here
Allowed IPs: 192.168.1.100, 10.0.0.50

# In n8n HTTP Request node headers
X-N8n-Signature: sha256=<calculated-signature>
```

#### Response Templates
```python
# Customize bot responses
Response Template: "Creating lead for {customer_name}... Please wait while I process this request."

# Available variables:
# - {workflow_name}
# - {user_name} 
# - Any extracted template variables
```

## 🎯 Usage Examples

### Example 1: Simple Lead Creation
**User says:** "Create a lead for John Doe"

**Workflow Configuration:**
```
Name: Create Lead
Keywords: create lead, new lead, add lead
n8n URL: https://n8n.example.com/webhook/create-lead
```

**n8n receives:**
```json
{
  "message": "Create a lead for John Doe",
  "user_id": 2,
  "user_name": "Administrator",
  "workflow_id": 1,
  "variables": {}
}
```

### Example 2: Advanced Parameter Extraction
**User says:** "Create a lead for Jane Smith with email jane@example.com"

**Workflow Configuration:**
```
Name: Advanced Lead Creation
Regex Mode: ✓ Enabled
Keywords: create lead for (?P<name>[A-Z][a-z]+ [A-Z][a-z]+).*email (?P<email>[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})

Template Variables: {
  "customer_name": "(?P<name>[A-Z][a-z]+ [A-Z][a-z]+)",
  "email": "(?P<email>[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,})"
}
```

**n8n receives:**
```json
{
  "message": "Create a lead for Jane Smith with email jane@example.com",
  "user_id": 2,
  "user_name": "Administrator",
  "workflow_id": 2,
  "variables": {
    "customer_name": "Jane Smith",
    "email": "jane@example.com"
  }
}
```

### Example 3: Workflow with Callback
**n8n workflow sends callback:**
```json
POST /n8n/webhook/callback/1
{
  "status": "success",
  "message": "Lead created successfully for Jane Smith",
  "lead_id": 123,
  "lead_url": "https://odoo.example.com/web#id=123&model=crm.lead"
}
```

**Bot responds:** "✅ Lead created successfully for Jane Smith"

## 📊 Dashboard & Monitoring

### Dashboard Features
- **Statistics Cards**: Active workflows, total executions, success rates
- **Execution Trends**: Line chart showing daily execution patterns
- **Status Distribution**: Pie chart of execution statuses
- **Top Workflows**: Most frequently used workflows
- **Recent Activity**: Latest workflow executions

### Accessing the Dashboard
```
n8n Integration → Dashboard
```

### Execution Logs
View detailed logs of all workflow executions:
```
n8n Integration → Execution Logs

Filters:
- Date range (Today, This Week, This Month)
- Status (Success, Failed, Pending, Timeout)
- Workflow
- User
```

## 🔧 API Endpoints

### Webhook Callbacks
```
POST /n8n/webhook/callback/<workflow_id>
Content-Type: application/json

{
  "status": "success|error",
  "message": "Response message",
  "data": {...}
}
```

### Manual Workflow Trigger
```
POST /n8n/webhook/trigger/<workflow_id>
Content-Type: application/json
Authorization: Bearer <session-token>

{
  "message": "Test message",
  "variables": {...}
}
```

### Workflow Status
```
GET /n8n/webhook/status/<workflow_id>
Authorization: Bearer <session-token>

Response:
{
  "workflow_id": 1,
  "workflow_name": "Create Lead",
  "active": true,
  "execution_count": 25,
  "success_rate": 92.0,
  "recent_executions": [...]
}
```

### Health Check
```
GET /n8n/health

Response:
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00Z",
  "version": "1.0.0"
}
```

## 🛡️ Security

### Access Control
The module implements three security levels:

1. **n8n User** (`group_n8n_user`)
   - Can trigger workflows through chatbot
   - Can view own execution logs
   - Can access dashboard

2. **n8n Manager** (`group_n8n_manager`)
   - All User permissions
   - Can create and edit workflows
   - Can view all execution logs
   - Cannot delete workflows or change settings

3. **n8n Administrator** (`group_n8n_admin`)
   - All Manager permissions
   - Can delete workflows
   - Can modify system settings
   - Full access to all features

### Webhook Security
- **IP Restrictions**: Limit webhook access to specific IP addresses
- **Signature Validation**: Verify webhook authenticity using HMAC signatures
- **API Key Authentication**: Optional API key validation

### Best Practices
1. Always use HTTPS for webhook URLs
2. Set up proper firewall rules for your n8n instance
3. Regularly rotate API keys and webhook secrets
4. Monitor execution logs for suspicious activity
5. Use specific user permissions rather than admin access

## 🔄 Troubleshooting

### Common Issues

#### Workflow Not Triggering
1. Check if workflow is active
2. Verify trigger keywords match exactly
3. Ensure user has permission to trigger workflow
4. Check execution logs for error details

#### Webhook Connection Failed
1. Verify n8n webhook URL is accessible
2. Check network connectivity between Odoo and n8n
3. Validate API key if configured
4. Check n8n logs for incoming webhook requests

#### Callback Not Received
1. Ensure callback URL is correct in n8n
2. Check webhook security settings
3. Verify n8n has permission to reach Odoo
4. Check execution logs for callback status

### Debug Mode
Enable debug logging in settings:
```
Settings → General Settings → n8n Integration
✓ Enable Debug Logging
```

### Log Analysis
```python
# View system logs
grep "n8n" /var/log/odoo/odoo.log

# View execution logs in Odoo
n8n Integration → Execution Logs
Filter: Status = Error
```

## 🧪 Testing

### Test Workflow Connection
1. Go to **n8n Integration** → **Workflows**
2. Open any workflow
3. Click **Test Workflow** button
4. Check execution logs for results

### Manual Testing
```bash
# Test webhook endpoint
curl -X POST https://your-odoo.com/n8n/webhook/callback/1 \
  -H "Content-Type: application/json" \
  -d '{"status": "success", "message": "Test callback"}'

# Test health endpoint  
curl https://your-odoo.com/n8n/health
```

## 📈 Performance Optimization

### Rate Limiting
```python
# Enable in settings
Settings → General Settings → n8n Integration
✓ Enable Rate Limiting
Rate Limit: 10 executions per user per minute
```

### Log Cleanup
Automatic cleanup runs daily, or manually trigger:
```python
Settings → General Settings → n8n Integration
Click: Cleanup Old Logs
```

### Database Optimization
```sql
-- Add indexes for better performance (if needed)
CREATE INDEX idx_n8n_execution_log_workflow_id ON n8n_execution_log(workflow_id);
CREATE INDEX idx_n8n_execution_log_user_id ON n8n_execution_log(user_id);
CREATE INDEX idx_n8n_execution_log_status ON n8n_execution_log(status);
CREATE INDEX idx_n8n_execution_log_create_date ON n8n_execution_log(create_date);
```

## 🤝 Contributing

### Development Setup
```bash
# Clone repository
git clone <repository-url>
cd odoo_n8n_chatbot

# Install development dependencies
pip install -r requirements-dev.txt

# Run tests
python -m pytest tests/
```

### Code Style
- Follow PEP 8 for Python code
- Use Odoo coding guidelines for models and views
- Add docstrings to all public methods
- Include type hints where appropriate

### Submitting Changes
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

This module is licensed under the **GNU Lesser General Public License v3.0**.

See [LICENSE](LICENSE) file for full license text.

## 📞 Support

### Documentation
- [Odoo Documentation](https://www.odoo.com/documentation/16.0/)
- [n8n Documentation](https://docs.n8n.io/)

### Community
- [Odoo Community Forum](https://www.odoo.com/forum)
- [n8n Community](https://community.n8n.io/)

### Commercial Support
For commercial support, customizations, or enterprise features:
- Email: support@yourcompany.com
- Website: https://www.yourcompany.com

## 🙏 Acknowledgments

- Odoo SA for the amazing ERP platform
- n8n team for the powerful workflow automation tool
- The open-source community for inspiration and contributions

---

**Made with ❤️ for the Odoo and n8n communities**