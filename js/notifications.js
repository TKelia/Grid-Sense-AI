class NotificationManager {
    constructor() {
        this.container = document.getElementById('notificationContainer');
        this.maxNotifications = 3;
        this.notificationTimeout = 5000;
        this.init();
    }

    init() {
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.id = 'notificationContainer';
            this.container.className = 'notification-container';
            document.body.appendChild(this.container);
        }

        // Subscribe to power events
        this.setupPowerEventListeners();
    }

    setupPowerEventListeners() {
        // Check for peak hours
        this.checkPeakHours();
        
        // Monitor high-usage devices
        this.monitorDeviceUsage();
        
        // Check overall power consumption
        this.monitorTotalConsumption();
    }

    show(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        
        const icon = this.getIcon(type);
        
        notification.innerHTML = `
            <i class="fas ${icon}"></i>
            <span>${message}</span>
            <button class="close-notification">×</button>
        `;

        // Add close button functionality
        const closeBtn = notification.querySelector('.close-notification');
        closeBtn.addEventListener('click', () => this.remove(notification));

        // Remove oldest notification if we exceed max
        while (this.container.children.length >= this.maxNotifications) {
            this.container.removeChild(this.container.firstChild);
        }

        // Add new notification
        this.container.appendChild(notification);

        // Auto remove after timeout
        setTimeout(() => this.remove(notification), this.notificationTimeout);

        // Add slide-in animation
        requestAnimationFrame(() => notification.classList.add('show'));
    }

    remove(notification) {
        notification.classList.remove('show');
        notification.classList.add('hide');
        
        // Remove after animation
        setTimeout(() => {
            if (notification.parentNode === this.container) {
                this.container.removeChild(notification);
            }
        }, 300);
    }

    getIcon(type) {
        const icons = {
            success: 'fa-check-circle',
            warning: 'fa-exclamation-triangle',
            error: 'fa-times-circle',
            info: 'fa-info-circle'
        };
        return icons[type] || icons.info;
    }

    checkPeakHours() {
        setInterval(() => {
            const hour = new Date().getHours();
            if (hour === 17) {
                this.show('Peak hours starting. Consider reducing power usage.', 'warning');
            } else if (hour === 21) {
                this.show('Peak hours ending. Thank you for your cooperation!', 'success');
            }
        }, 60000); // Check every minute
    }

    monitorDeviceUsage() {
        // This would be connected to real-time device data in production
        this.deviceThresholds = {
            'AC': 1200,
            'Dryer': 3000,
            'Oven': 2400,
            'Water Heater': 4500
        };
    }

    monitorTotalConsumption() {
        let previousUsage = 0;
        
        // This would be connected to real-time power data in production
        setInterval(async () => {
            try {
                const response = await fetch('/api/power/current');
                const data = await response.json();
                
                if (data.totalUsage > 5000) {
                    this.show('High power consumption detected!', 'warning');
                }
                
                // Alert on sudden spikes
                if (previousUsage > 0 && data.totalUsage > previousUsage * 1.5) {
                    this.show('Sudden increase in power consumption detected', 'warning');
                }
                
                previousUsage = data.totalUsage;
                
            } catch (error) {
                console.error('Error monitoring power consumption:', error);
            }
        }, 30000); // Check every 30 seconds
    }

    // AI-powered notifications
    async checkAIInsights() {
        try {
            const response = await fetch('/api/power/insights');
            const data = await response.json();
            
            data.insights.forEach(insight => {
                this.show(insight.message, insight.type);
            });
            
        } catch (error) {
            console.error('Error fetching AI insights:', error);
        }
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.notifications = new NotificationManager();
});
