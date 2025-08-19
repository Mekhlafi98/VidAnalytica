{
    'name': 'Odoo n8n Chatbot Integration',
    'version': '16.0.1.0.0',
    'category': 'Discuss',
    'summary': 'Advanced chatbot integration with n8n workflows for automation',
    'description': """
Odoo n8n Chatbot Integration
============================

This module provides a sophisticated integration between Odoo's chatbot system and n8n workflows,
enabling powerful automation capabilities through natural language commands.

Key Features:
* Chatbot command detection and parsing
* Dynamic n8n workflow triggering
* Webhook callback handling
* Comprehensive logging and auditing
* Role-based access control
* Template variables and multi-language support
* Dashboard for workflow monitoring

Installation:
1. Install n8n separately (https://n8n.io/)
2. Configure webhook endpoints in n8n
3. Set up API authentication
4. Configure workflows in Odoo

Usage:
* Use natural language commands in chat: "Create a lead for John Doe"
* Configure workflows through the UI
* Monitor execution through the dashboard
    """,
    'author': 'Your Company',
    'website': 'https://www.yourcompany.com',
    'license': 'LGPL-3',
    'depends': [
        'base',
        'mail',
        'web',
        'contacts',
    ],
    'data': [
        'security/security.xml',
        'security/ir.model.access.csv',
        'data/n8n_workflow_data.xml',
        'views/n8n_workflow_views.xml',
        'views/n8n_execution_log_views.xml',
        'views/chatbot_dashboard_views.xml',
        'views/res_config_settings_views.xml',
        'views/menu_views.xml',
    ],
    'demo': [
        'demo/demo_workflows.xml',
    ],
    'assets': {
        'web.assets_backend': [
            'odoo_n8n_chatbot/static/src/css/dashboard.css',
            'odoo_n8n_chatbot/static/src/js/dashboard.js',
        ],
    },
    'installable': True,
    'application': False,
    'auto_install': False,
    'external_dependencies': {
        'python': ['requests', 'validators'],
    },
}