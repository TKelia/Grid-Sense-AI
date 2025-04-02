// Check authentication
if (!localStorage.getItem('authToken')) {
    window.location.href = '/login';
}

class Dashboard {
    constructor() {
        this.currentTimeframe = 'day';
        this.chart = null;
        this.devices = [];
        this.insights = [];
        this.currentUsage = document.getElementById('currentUsage');
        this.dailyAverage = document.getElementById('dailyAverage');
        this.monthlyTotal = document.getElementById('monthlyTotal');
        this.usageIndicator = document.getElementById('usageIndicator');
        this.insightsList = document.getElementById('insightsList');
        this.init();
    }

    async init() {
        // Check authentication
        const token = localStorage.getItem('authToken');
        if (!token) {
            window.location.href = 'login.html';
            return;
        }

        this.setupTimeframeButtons();
        this.setupUserInfo();
        await this.fetchCurrentUsage();
        await this.fetchHistoricalData();
        this.startRealTimeUpdates();

        // Start updating power usage
        this.updatePowerUsage();
        setInterval(() => this.updatePowerUsage(), 5000);

        // Load initial insights
        this.loadInsights();
    }

    setupTimeframeButtons() {
        const buttons = document.querySelectorAll('.time-btn');
        buttons.forEach(btn => {
            btn.addEventListener('click', () => {
                buttons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentTimeframe = btn.dataset.timeframe;
                this.fetchHistoricalData();
            });
        });
    }

    setupUserInfo() {
        const userEmail = localStorage.getItem('userEmail');
        if (userEmail) {
            document.getElementById('userEmail').textContent = userEmail;
        }
    }

    async fetchCurrentUsage() {
        try {
            const response = await fetch('/api/power/current');
            const data = await response.json();
            
            this.updateCurrentUsage(data);
            this.updateDevices(data.devices);
            this.updateInsights(data.insights);
            
        } catch (error) {
            this.showNotification('Error fetching current usage data', 'error');
        }
    }

    async fetchHistoricalData() {
        try {
            const response = await fetch(`/api/power/history?timeframe=${this.currentTimeframe}`);
            const data = await response.json();
            
            this.updateChart(data);
            
        } catch (error) {
            this.showNotification('Error fetching historical data', 'error');
        }
    }

    updateCurrentUsage(data) {
        document.getElementById('totalUsage').textContent = data.totalUsage.toLocaleString();
        
        // Update peak hours alert
        const peakAlert = document.getElementById('peakAlert');
        const currentHour = new Date().getHours();
        if (currentHour >= 17 && currentHour <= 21) {
            peakAlert.style.display = 'flex';
        } else {
            peakAlert.style.display = 'none';
        }
    }

    updateDevices(devices) {
        const grid = document.getElementById('devicesGrid');
        if (!grid) return;

        grid.innerHTML = devices.map(device => `
            <div class="device-card">
                <i class="fas ${this.getDeviceIcon(device.type)} device-icon"></i>
                <div class="device-name">${device.name}</div>
                <div class="device-usage">${device.usage}W</div>
            </div>
        `).join('');
    }

    updateInsights(insights) {
        const container = document.getElementById('insightsContainer');
        if (!container) return;

        container.innerHTML = insights.map(insight => `
            <div class="insight-card ${insight.type}">
                <i class="fas ${this.getInsightIcon(insight.type)} insight-icon"></i>
                <div class="insight-content">
                    <h4>${insight.device || 'System Insight'}</h4>
                    <p>${insight.message}</p>
                </div>
            </div>
        `).join('');
    }

    updateChart(data) {
        const ctx = document.getElementById('usageChart').getContext('2d');
        
        if (this.chart) {
            this.chart.destroy();
        }

        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.data.map(d => d.time),
                datasets: [{
                    label: 'Power Usage (W)',
                    data: data.data.map(d => d.usage),
                    borderColor: '#1a237e',
                    backgroundColor: 'rgba(26, 35, 126, 0.1)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
    }

    updatePowerUsage() {
        // Simulate real-time power usage data
        const usage = (Math.random() * 4 + 1).toFixed(2); // Between 1-5 kW
        const daily = (Math.random() * 10 + 20).toFixed(1); // Between 20-30 kWh
        const monthly = Math.floor(Math.random() * 300 + 500); // Between 500-800 kWh

        // Update display
        this.currentUsage.textContent = usage;
        this.dailyAverage.textContent = daily + ' kWh';
        this.monthlyTotal.textContent = monthly + ' kWh';

        // Update gauge (assuming 5kW is max)
        const percentage = (usage / 5) * 100;
        this.usageIndicator.style.width = percentage + '%';

        // Update color based on usage
        if (percentage > 80) {
            this.usageIndicator.style.background = '#ff4444';
        } else if (percentage > 60) {
            this.usageIndicator.style.background = '#ffb838';
        } else {
            this.usageIndicator.style.background = '#00b894';
        }
    }

    loadInsights() {
        const insights = [
            {
                icon: 'lightbulb',
                text: 'Your power usage is 15% higher than usual during evening hours. Consider using natural light or LED bulbs.'
            },
            {
                icon: 'clock',
                text: 'Peak energy rates are in effect from 5 PM to 9 PM. Try to run major appliances outside these hours.'
            },
            {
                icon: 'chart-line',
                text: 'Your monthly consumption trend shows a 10% decrease. Great job on energy conservation!'
            },
            {
                icon: 'temperature-high',
                text: 'HVAC system shows increased activity. Check your thermostat settings and consider a smart thermostat.'
            }
        ];

        this.insightsList.innerHTML = insights.map(insight => `
            <div class="insight">
                <i class="fas fa-${insight.icon}"></i>
                <p>${insight.text}</p>
            </div>
        `).join('');
    }

    getDeviceIcon(type) {
        const icons = {
            entertainment: 'fa-tv',
            appliance: 'fa-plug',
            hvac: 'fa-snowflake',
            electronics: 'fa-laptop',
            lighting: 'fa-lightbulb'
        };
        return icons[type] || 'fa-plug';
    }

    getInsightIcon(type) {
        const icons = {
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle',
            alert: 'fa-bell',
            success: 'fa-check-circle'
        };
        return icons[type] || 'fa-info-circle';
    }

    showNotification(message, type = 'info') {
        const container = document.getElementById('notificationContainer');
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas ${this.getInsightIcon(type)}"></i>
            <span>${message}</span>
        `;
        
        container.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }

    startRealTimeUpdates() {
        // Update current usage every 30 seconds
        setInterval(() => this.fetchCurrentUsage(), 30000);
        
        // Update historical data every 5 minutes
        setInterval(() => this.fetchHistoricalData(), 300000);
    }
}

// Initialize dashboard when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.dashboard = new Dashboard();
});
