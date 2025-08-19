odoo.define('odoo_n8n_chatbot.dashboard', function (require) {
"use strict";

var AbstractAction = require('web.AbstractAction');
var core = require('web.core');
var rpc = require('web.rpc');
var ajax = require('web.ajax');

var QWeb = core.qweb;
var _t = core._t;

var N8nDashboard = AbstractAction.extend({
    template: 'N8nDashboardTemplate',
    
    events: {
        'click .refresh-btn': '_onRefreshClick',
        'click .workflow-card': '_onWorkflowClick',
        'click .log-row': '_onLogClick',
    },
    
    init: function(parent, action) {
        this._super.apply(this, arguments);
        this.dashboard_data = {};
        this.charts = {};
    },
    
    willStart: function() {
        var self = this;
        return this._super().then(function() {
            return self._loadDashboardData();
        });
    },
    
    start: function() {
        var self = this;
        return this._super().then(function() {
            self._renderDashboard();
            self._setupCharts();
            self._setupAutoRefresh();
        });
    },
    
    _loadDashboardData: function() {
        var self = this;
        return rpc.query({
            model: 'n8n.workflow',
            method: 'get_dashboard_data',
            args: [],
        }).then(function(data) {
            self.dashboard_data = data;
        }).catch(function(error) {
            console.error('Error loading dashboard data:', error);
            self.dashboard_data = self._getEmptyDashboardData();
        });
    },
    
    _getEmptyDashboardData: function() {
        return {
            stats: {
                active_workflows: 0,
                total_executions: 0,
                success_rate: 0,
                avg_response_time: 0
            },
            execution_trends: [],
            status_distribution: [],
            top_workflows: [],
            recent_activity: []
        };
    },
    
    _renderDashboard: function() {
        var self = this;
        var stats = this.dashboard_data.stats;
        
        // Update statistics cards
        this.$('#active_workflows_count').text(stats.active_workflows);
        this.$('#total_executions').text(stats.total_executions);
        this.$('#success_rate').text(stats.success_rate.toFixed(1) + '%');
        this.$('#avg_response_time').text(stats.avg_response_time + 'ms');
        
        // Render top workflows table
        this._renderTopWorkflows();
        
        // Render recent activity table
        this._renderRecentActivity();
    },
    
    _renderTopWorkflows: function() {
        var self = this;
        var tbody = this.$('#top_workflows_table tbody');
        tbody.empty();
        
        _.each(this.dashboard_data.top_workflows, function(workflow) {
            var row = $('<tr>').addClass('workflow-row').data('id', workflow.id);
            row.append($('<td>').text(workflow.name));
            row.append($('<td>').text(workflow.execution_count));
            row.append($('<td>').text(workflow.success_rate.toFixed(1) + '%'));
            tbody.append(row);
        });
        
        // Add click handlers
        tbody.find('.workflow-row').click(function() {
            var workflowId = $(this).data('id');
            self._openWorkflow(workflowId);
        });
    },
    
    _renderRecentActivity: function() {
        var self = this;
        var tbody = this.$('#recent_activity_table tbody');
        tbody.empty();
        
        _.each(this.dashboard_data.recent_activity, function(activity) {
            var row = $('<tr>').addClass('log-row').data('id', activity.id);
            
            // Format time
            var time = moment(activity.created).format('HH:mm');
            row.append($('<td>').text(time));
            
            // Workflow name
            row.append($('<td>').text(activity.workflow_name));
            
            // User name
            row.append($('<td>').text(activity.user_name));
            
            // Status with badge
            var statusBadge = $('<span>')
                .addClass('badge')
                .addClass(self._getStatusBadgeClass(activity.status))
                .text(activity.status);
            row.append($('<td>').append(statusBadge));
            
            tbody.append(row);
        });
        
        // Add click handlers
        tbody.find('.log-row').click(function() {
            var logId = $(this).data('id');
            self._openExecutionLog(logId);
        });
    },
    
    _getStatusBadgeClass: function(status) {
        var classes = {
            'success': 'badge-success',
            'error': 'badge-danger',
            'pending': 'badge-warning',
            'pending_callback': 'badge-info',
            'timeout': 'badge-secondary'
        };
        return classes[status] || 'badge-secondary';
    },
    
    _setupCharts: function() {
        this._setupExecutionTrendsChart();
        this._setupStatusDistributionChart();
    },
    
    _setupExecutionTrendsChart: function() {
        var ctx = this.$('#execution_trends_chart')[0];
        if (!ctx) return;
        
        var data = this.dashboard_data.execution_trends;
        var labels = _.pluck(data, 'date');
        var successData = _.pluck(data, 'success');
        var errorData = _.pluck(data, 'error');
        
        this.charts.executionTrends = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Successful',
                    data: successData,
                    borderColor: '#28a745',
                    backgroundColor: 'rgba(40, 167, 69, 0.1)',
                    fill: true
                }, {
                    label: 'Failed',
                    data: errorData,
                    borderColor: '#dc3545',
                    backgroundColor: 'rgba(220, 53, 69, 0.1)',
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    },
    
    _setupStatusDistributionChart: function() {
        var ctx = this.$('#status_distribution_chart')[0];
        if (!ctx) return;
        
        var data = this.dashboard_data.status_distribution;
        var labels = _.pluck(data, 'status');
        var counts = _.pluck(data, 'count');
        
        var colors = {
            'success': '#28a745',
            'error': '#dc3545',
            'pending': '#ffc107',
            'pending_callback': '#17a2b8',
            'timeout': '#6c757d'
        };
        
        var backgroundColors = labels.map(function(label) {
            return colors[label] || '#6c757d';
        });
        
        this.charts.statusDistribution = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: counts,
                    backgroundColor: backgroundColors,
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    },
    
    _setupAutoRefresh: function() {
        var self = this;
        // Auto-refresh every 30 seconds
        this.refreshInterval = setInterval(function() {
            self._refreshDashboard();
        }, 30000);
    },
    
    _refreshDashboard: function() {
        var self = this;
        return this._loadDashboardData().then(function() {
            self._renderDashboard();
            self._updateCharts();
        });
    },
    
    _updateCharts: function() {
        // Update execution trends chart
        if (this.charts.executionTrends) {
            var data = this.dashboard_data.execution_trends;
            this.charts.executionTrends.data.labels = _.pluck(data, 'date');
            this.charts.executionTrends.data.datasets[0].data = _.pluck(data, 'success');
            this.charts.executionTrends.data.datasets[1].data = _.pluck(data, 'error');
            this.charts.executionTrends.update();
        }
        
        // Update status distribution chart
        if (this.charts.statusDistribution) {
            var statusData = this.dashboard_data.status_distribution;
            this.charts.statusDistribution.data.labels = _.pluck(statusData, 'status');
            this.charts.statusDistribution.data.datasets[0].data = _.pluck(statusData, 'count');
            this.charts.statusDistribution.update();
        }
    },
    
    _onRefreshClick: function(ev) {
        ev.preventDefault();
        var $btn = $(ev.currentTarget);
        $btn.addClass('loading');
        
        var self = this;
        this._refreshDashboard().then(function() {
            $btn.removeClass('loading');
            self._showNotification(_t('Dashboard refreshed'), 'success');
        }).catch(function() {
            $btn.removeClass('loading');
            self._showNotification(_t('Failed to refresh dashboard'), 'danger');
        });
    },
    
    _onWorkflowClick: function(ev) {
        var workflowId = $(ev.currentTarget).data('id');
        this._openWorkflow(workflowId);
    },
    
    _onLogClick: function(ev) {
        var logId = $(ev.currentTarget).data('id');
        this._openExecutionLog(logId);
    },
    
    _openWorkflow: function(workflowId) {
        this.do_action({
            type: 'ir.actions.act_window',
            res_model: 'n8n.workflow',
            res_id: workflowId,
            view_mode: 'form',
            target: 'current'
        });
    },
    
    _openExecutionLog: function(logId) {
        this.do_action({
            type: 'ir.actions.act_window',
            res_model: 'n8n.execution.log',
            res_id: logId,
            view_mode: 'form',
            target: 'new'
        });
    },
    
    _showNotification: function(message, type) {
        this.do_notify(message, '', type !== 'danger');
    },
    
    destroy: function() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
        }
        
        // Destroy charts
        _.each(this.charts, function(chart) {
            if (chart) {
                chart.destroy();
            }
        });
        
        this._super.apply(this, arguments);
    }
});

// Register the dashboard action
core.action_registry.add('n8n_dashboard', N8nDashboard);

return N8nDashboard;

});

// Dashboard template
odoo.define('odoo_n8n_chatbot.dashboard_template', function (require) {
"use strict";

var core = require('web.core');
var QWeb = core.qweb;

// Add the dashboard template
QWeb.add_template(`
<templates>
    <t t-name="N8nDashboardTemplate">
        <div class="o_dashboard">
            <!-- Dashboard content will be loaded here -->
            <div class="d-flex justify-content-center align-items-center" style="height: 200px;">
                <div class="text-center">
                    <i class="fa fa-spinner fa-spin fa-3x text-muted"></i>
                    <p class="mt-3 text-muted">Loading dashboard...</p>
                </div>
            </div>
        </div>
    </t>
</templates>
`);

});