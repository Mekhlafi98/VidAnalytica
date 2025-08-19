# Installation Guide

This guide provides detailed instructions for installing and configuring the Odoo n8n Chatbot Integration module.

## 📋 Prerequisites

### System Requirements

| Component | Minimum Version | Recommended |
|-----------|----------------|-------------|
| Odoo | 16.0 | 16.0+ |
| Python | 3.8 | 3.10+ |
| PostgreSQL | 12 | 14+ |
| n8n | Any | Latest |

### Python Dependencies

```bash
# Required packages
pip install requests>=2.25.0
pip install validators>=0.18.0

# Optional for development
pip install pytest>=6.0.0
pip install black>=21.0.0
pip install flake8>=3.8.0
```

## 🚀 Installation Steps

### Step 1: Download the Module

#### Option A: Download ZIP
1. Download the module ZIP file
2. Extract to your Odoo addons directory:
   ```bash
   cd /path/to/odoo/addons
   unzip odoo_n8n_chatbot.zip
   ```

#### Option B: Git Clone
```bash
cd /path/to/odoo/addons
git clone https://github.com/yourcompany/odoo-n8n-chatbot.git odoo_n8n_chatbot
```

### Step 2: Install Python Dependencies

```bash
# Activate your Odoo virtual environment (if using one)
source /path/to/odoo-venv/bin/activate

# Install required packages
pip install requests validators

# Verify installation
python -c "import requests, validators; print('Dependencies installed successfully')"
```

### Step 3: Update Odoo Configuration

Add the module path to your Odoo configuration file:

```ini
# /etc/odoo/odoo.conf or ~/.odoorc
[options]
addons_path = /path/to/odoo/addons,/path/to/custom/addons,/path/to/odoo_n8n_chatbot
```

### Step 4: Restart Odoo Server

```bash
# For system service
sudo systemctl restart odoo

# For manual installation
./odoo-bin -c /path/to/odoo.conf --stop-after-init --update=all
./odoo-bin -c /path/to/odoo.conf
```

### Step 5: Install Module in Odoo

1. **Access Odoo Interface**
   - Open your browser and go to your Odoo instance
   - Log in as administrator

2. **Enable Developer Mode**
   - Go to Settings → General Settings
   - Scroll down and click "Activate the developer mode"

3. **Update Apps List**
   - Go to Apps menu
   - Click "Update Apps List" button
   - Confirm the update

4. **Install the Module**
   - Search for "n8n Integration" or "Chatbot"
   - Click "Install" on the "Odoo n8n Chatbot Integration" module
   - Wait for installation to complete

## ⚙️ Initial Configuration

### Step 1: Basic Settings

1. **Navigate to Settings**
   ```
   Settings → General Settings → n8n Integration
   ```

2. **Enable Integration**
   ```
   ✓ Enable n8n Integration
   n8n Base URL: https://your-n8n-instance.com
   Global n8n API Key: [optional]
   ```

3. **Save Settings**
   - Click "Save" to apply changes
   - Test connection using "Test Connection" button

### Step 2: Security Configuration

1. **Webhook Security** (Recommended)
   ```
   Webhook Secret Key: your-secret-key-here
   Allowed Webhook IPs: 192.168.1.100, 10.0.0.50
   ```

2. **Rate Limiting** (Optional)
   ```
   ✓ Enable Rate Limiting
   Rate Limit: 10 executions per user per minute
   ```

3. **Logging Settings**
   ```
   Log Retention: 30 days
   ✓ Enable Debug Logging (for troubleshooting)
   ```

### Step 3: User Permissions

1. **Assign User Groups**
   ```
   Settings → Users & Companies → Users
   
   For each user, assign appropriate groups:
   - n8n User: Basic workflow triggering
   - n8n Manager: Workflow management
   - n8n Administrator: Full access
   ```

2. **Create Test User** (Optional)
   ```
   Name: n8n Test User
   Login: n8ntest
   Groups: n8n User
   ```

## 🔧 n8n Setup

### Step 1: Install n8n

#### Option A: n8n Cloud
1. Sign up at [n8n.cloud](https://n8n.cloud)
2. Create your workspace
3. Note your instance URL

#### Option B: Self-hosted
```bash
# Using npm
npm install n8n -g
n8n start

# Using Docker
docker run -it --rm \
  --name n8n \
  -p 5678:5678 \
  -v ~/.n8n:/home/node/.n8n \
  n8nio/n8n
```

### Step 2: Create Test Workflow

1. **Create New Workflow**
   - Open n8n interface
   - Click "New Workflow"

2. **Add Webhook Trigger**
   ```
   Node: Webhook
   HTTP Method: POST
   Path: test-webhook
   ```

3. **Add Response Node**
   ```
   Node: Respond to Webhook
   Response Code: 200
   Response Body: {"status": "success", "message": "Test successful"}
   ```

4. **Save and Activate**
   - Save the workflow
   - Set it to "Active"
   - Copy the webhook URL

### Step 3: Create Odoo Workflow

1. **Navigate to Workflows**
   ```
   n8n Integration → Workflows → Create
   ```

2. **Configure Test Workflow**
   ```
   Name: Test Webhook
   Description: Simple test workflow
   
   Trigger Keywords:
   test webhook
   test n8n
   
   n8n Webhook URL: [paste from n8n]
   HTTP Method: POST
   Expect Callback: No
   ```

3. **Save and Test**
   - Save the workflow
   - Click "Test Workflow" button
   - Check execution logs

## ✅ Verification

### Test 1: Basic Functionality
1. Open Odoo chat/messaging
2. Type: "test webhook"
3. Verify bot responds with success message
4. Check execution logs for details

### Test 2: Dashboard Access
1. Navigate to: `n8n Integration → Dashboard`
2. Verify statistics display correctly
3. Check for any error messages

### Test 3: Webhook Callback
1. Create workflow with callback enabled
2. Configure n8n to send callback
3. Test and verify response received

## 🐛 Troubleshooting

### Common Installation Issues

#### Module Not Found
```bash
# Check module path
ls -la /path/to/odoo/addons/odoo_n8n_chatbot

# Verify odoo.conf addons_path
grep addons_path /etc/odoo/odoo.conf

# Restart Odoo and update apps list
```

#### Python Dependencies Missing
```bash
# Install in correct environment
which python
pip list | grep requests
pip install requests validators
```

#### Permission Denied
```bash
# Fix file permissions
sudo chown -R odoo:odoo /path/to/odoo_n8n_chatbot
sudo chmod -R 755 /path/to/odoo_n8n_chatbot
```

#### Database Connection Issues
```sql
-- Check if tables were created
\dt n8n*

-- If missing, reinstall module
-- In Odoo: Apps → n8n Integration → Uninstall → Install
```

### Configuration Issues

#### n8n Connection Failed
1. Verify n8n URL is accessible
2. Check firewall settings
3. Test with curl:
   ```bash
   curl -I https://your-n8n-instance.com
   ```

#### Webhook Not Triggering
1. Check workflow is active
2. Verify trigger keywords match exactly
3. Test with manual trigger
4. Check user permissions

#### Callback Not Received
1. Verify callback URL is accessible from n8n
2. Check webhook security settings
3. Test callback manually:
   ```bash
   curl -X POST https://your-odoo.com/n8n/webhook/callback/1 \
     -H "Content-Type: application/json" \
     -d '{"status": "success", "message": "Test"}'
   ```

## 🔄 Upgrade Instructions

### From Previous Version
1. **Backup Database**
   ```bash
   pg_dump your_database > backup_$(date +%Y%m%d).sql
   ```

2. **Update Module Files**
   ```bash
   cd /path/to/odoo/addons
   rm -rf odoo_n8n_chatbot
   # Download/extract new version
   ```

3. **Update in Odoo**
   ```
   Apps → Update Apps List
   Apps → n8n Integration → Update
   ```

4. **Verify Functionality**
   - Test existing workflows
   - Check dashboard
   - Review settings

## 📞 Support

### Getting Help

1. **Check Logs**
   ```bash
   tail -f /var/log/odoo/odoo.log | grep n8n
   ```

2. **Enable Debug Mode**
   ```
   Settings → General Settings → n8n Integration
   ✓ Enable Debug Logging
   ```

3. **Contact Support**
   - Email: support@yourcompany.com
   - Documentation: [Link to docs]
   - Community: [Link to forum]

### Reporting Issues

When reporting issues, include:
- Odoo version and build
- Module version
- Error messages from logs
- Steps to reproduce
- Expected vs actual behavior

## 🎯 Next Steps

After successful installation:

1. **Create Production Workflows**
   - Plan your automation scenarios
   - Design n8n workflows
   - Configure Odoo workflows
   - Test thoroughly

2. **Set Up Monitoring**
   - Configure dashboard alerts
   - Set up log retention
   - Plan backup strategy

3. **Train Users**
   - Create user documentation
   - Conduct training sessions
   - Establish support procedures

4. **Optimize Performance**
   - Monitor execution metrics
   - Tune rate limiting
   - Optimize database queries

---

**Installation complete! 🎉**

Your Odoo n8n Chatbot Integration is now ready for use.