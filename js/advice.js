// AI-powered advice system
class EnergyAdvisor {
    constructor() {
        this.recommendationsList = document.getElementById('recommendationsList');
        this.adviceList = document.getElementById('adviceList');
        this.questionInput = document.getElementById('adviceQuestion');
        this.sendButton = document.getElementById('sendQuestion');
        
        // Pre-defined energy-saving tips and advice
        this.tips = {
            lighting: [
                "Switch to LED bulbs to save up to 80% on lighting energy",
                "Use natural light during the day when possible",
                "Install motion sensors for outdoor lighting",
                "Clean light fixtures regularly for maximum efficiency"
            ],
            appliances: [
                "Run full loads in washing machines and dishwashers",
                "Use cold water for laundry when possible",
                "Clean refrigerator coils every 6 months",
                "Use energy-efficient settings on your appliances"
            ],
            heating: [
                "Set your thermostat to 68°F (20°C) in winter",
                "Regular HVAC maintenance saves 10-15% on heating costs",
                "Use ceiling fans to distribute warm air in winter",
                "Seal air leaks around windows and doors"
            ],
            cooling: [
                "Set your thermostat to 78°F (26°C) in summer",
                "Use ceiling fans to feel cooler without lowering AC",
                "Close curtains during peak sun hours",
                "Clean AC filters monthly during peak season"
            ],
            general: [
                "Unplug electronics when not in use to avoid phantom power",
                "Use power strips for easy management of multiple devices",
                "Schedule regular energy audits",
                "Monitor your energy usage patterns"
            ]
        };

        this.init();
    }

    async init() {
        await this.loadRecommendations();
        this.updateSavingsChart();
        
        // Refresh recommendations every 5 minutes
        setInterval(() => this.loadRecommendations(), 300000);

        // Add welcome message
        this.addMessage({
            type: 'advisor',
            content: "Hello! I'm your personal energy advisor. Ask me anything about saving energy in your home!"
        });

        // Setup event listeners
        this.sendButton.addEventListener('click', () => this.handleQuestion());
        this.questionInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleQuestion();
            }
        });
    }

    async loadRecommendations() {
        try {
            const response = await fetch('/GridSenseAI/php/advice.php?action=recommendations');
            const data = await response.json();

            if (!data.success) {
                throw new Error(data.error);
            }

            this.renderRecommendations(data.data);

        } catch (error) {
            console.error('Error loading recommendations:', error);
            this.showError('Failed to load energy saving recommendations');
        }
    }

    renderRecommendations(recommendations) {
        if (!this.recommendationsList) return;

        this.recommendationsList.innerHTML = recommendations.map(rec => `
            <div class="recommendation-card">
                <div class="recommendation-icon">
                    <i class="fas ${this.getRecommendationIcon(rec.category)}"></i>
                </div>
                <div class="recommendation-content">
                    <h4>${rec.title}</h4>
                    <p>${rec.description}</p>
                    <div class="recommendation-stats">
                        <span class="savings">
                            <i class="fas fa-bolt"></i>
                            ${rec.potential_savings}% potential savings
                        </span>
                        <span class="difficulty ${rec.difficulty.toLowerCase()}">
                            ${rec.difficulty}
                        </span>
                    </div>
                </div>
            </div>
        `).join('');
    }

    updateSavingsChart() {
        if (!window.dashboard || !window.dashboard.charts.savings) return;

        // Calculate potential savings (this would normally come from the backend)
        const potentialSavings = Math.floor(Math.random() * 30) + 10; // 10-40%
        
        window.dashboard.charts.savings.data.datasets[0].data = [
            potentialSavings,
            100 - potentialSavings
        ];
        window.dashboard.charts.savings.update();
    }

    getRecommendationIcon(category) {
        const icons = {
            'HVAC': 'fa-temperature-high',
            'Lighting': 'fa-lightbulb',
            'Appliances': 'fa-plug',
            'Behavior': 'fa-user',
            'Schedule': 'fa-clock',
            'Maintenance': 'fa-tools'
        };
        return icons[category] || 'fa-lightbulb';
    }

    showError(message) {
        console.error(message);
        // Implement error display logic here
    }

    handleQuestion() {
        const question = this.questionInput.value.trim().toLowerCase();
        if (!question) return;

        // Add user question to chat
        this.addMessage({
            type: 'user',
            content: question
        });

        // Clear input
        this.questionInput.value = '';

        // Generate response based on keywords
        setTimeout(() => {
            const response = this.generateResponse(question);
            this.addMessage({
                type: 'advisor',
                content: response
            });
        }, 500);
    }

    generateResponse(question) {
        // Check for specific categories
        if (question.includes('light') || question.includes('bulb')) {
            return this.getRandomTip('lighting');
        } else if (question.includes('appliance') || question.includes('washer') || question.includes('dryer')) {
            return this.getRandomTip('appliances');
        } else if (question.includes('heat') || question.includes('winter')) {
            return this.getRandomTip('heating');
        } else if (question.includes('cool') || question.includes('summer') || question.includes('ac')) {
            return this.getRandomTip('cooling');
        } else if (question.includes('save') || question.includes('reduce')) {
            return this.getRandomTip('general');
        }

        // Default response for unknown questions
        return "Here's a general energy-saving tip: " + this.getRandomTip('general');
    }

    getRandomTip(category) {
        const tips = this.tips[category];
        return tips[Math.floor(Math.random() * tips.length)];
    }

    addMessage(message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `advice-message ${message.type}`;
        
        const icon = message.type === 'advisor' ? 'robot' : 'user';
        
        messageDiv.innerHTML = `
            <div class="message-avatar">
                <i class="fas fa-${icon}"></i>
            </div>
            <div class="message-content">
                <p>${message.content}</p>
                <span class="message-time">${this.formatTime()}</span>
            </div>
        `;

        this.adviceList.appendChild(messageDiv);
        this.adviceList.scrollTop = this.adviceList.scrollHeight;
    }

    formatTime() {
        const now = new Date();
        return now.toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit',
            hour12: true 
        });
    }
}

// AI Insights functionality
const API_BASE_URL = 'http://localhost/GridSenseAI/php';

// Icons for different insight types
const INSIGHT_ICONS = {
    peak_hours: 'fa-clock',
    usage_spike: 'fa-bolt',
    device_efficiency: 'fa-plug',
    hvac_optimization: 'fa-snowflake',
    appliance_usage: 'fa-home',
    general_tip: 'fa-lightbulb'
};

// Colors for different impact levels
const IMPACT_COLORS = {
    high: '#d63031',
    medium: '#fdcb6e',
    low: '#00b894'
};

// Fetch and display insights
const refreshInsights = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/advice.php`);
        const result = await response.json();
        
        if (!result.success) {
            throw new Error(result.message || 'Failed to fetch insights');
        }
        
        const insights = result.data;
        displayInsights(insights);
        
    } catch (error) {
        console.error('Error fetching insights:', error);
        // Show error notification
    }
};

// Display insights in the UI
const displayInsights = (insights) => {
    const insightsList = document.getElementById('insightsList');
    if (!insightsList) return;
    
    insightsList.innerHTML = '';
    
    insights.forEach(insight => {
        const card = document.createElement('div');
        card.className = 'insight-card';
        card.innerHTML = `
            <div class="insight-icon" style="color: ${IMPACT_COLORS[insight.impact]}">
                <i class="fas ${INSIGHT_ICONS[insight.type] || 'fa-info-circle'}"></i>
            </div>
            <div class="insight-content">
                <h3>${insight.title}</h3>
                <p>${insight.description}</p>
                <div class="insight-meta">
                    <span class="impact-badge" style="background: ${IMPACT_COLORS[insight.impact]}">
                        ${insight.impact.charAt(0).toUpperCase() + insight.impact.slice(1)} Impact
                    </span>
                    <span class="saving-badge">
                        <i class="fas fa-piggy-bank"></i>
                        Save up to ${insight.potential_saving}
                    </span>
                </div>
            </div>
        `;
        
        insightsList.appendChild(card);
    });
};

// Initialize advisor when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.energyAdvisor = new EnergyAdvisor();
    refreshInsights();
    // Refresh insights every 5 minutes
    setInterval(refreshInsights, 300000);
});

// AI-Powered Insights
class EnergyInsights {
    constructor() {
        this.threshold = 1000; // Threshold for high usage alert
    }

    analyzeUsage(devices) {
        console.log('Analyzing usage for devices:', devices); // Log the devices being analyzed
        console.log('Insights analysis started.');
        let totalPower = 0;
        let highUsageDevices = [];

        devices.forEach(device => {
            totalPower += device.power;
            if (device.power > this.threshold) {
                highUsageDevices.push(device);
            }
        });

        console.log('Total power:', totalPower); // Log total power
        console.log('High usage devices:', highUsageDevices); // Log high usage devices

        this.displayAlerts(totalPower, highUsageDevices);
        this.suggestEnergySavingTips(highUsageDevices);
    }

    displayAlerts(totalPower, highUsageDevices) {
        if (totalPower > this.threshold) {
            console.warn('High Usage Alert: Your total power usage is high! Current usage: ' + totalPower + 'W.');
            // Display alert in the UI
            this.showAlert('High Usage Alert', 'Your total power usage is ' + totalPower + 'W, which exceeds the recommended limit.');
        }

        if (highUsageDevices.length > 0) {
            highUsageDevices.forEach(device => {
                this.showAlert('High Usage Device', device.name + ' is consuming ' + device.power + 'W. Consider reducing usage.');
            });
        }
    }

    suggestEnergySavingTips(highUsageDevices) {
        highUsageDevices.forEach(device => {
            let tip = '';
            switch (device.type) {
                case 'HVAC':
                    tip = 'Consider setting your thermostat a few degrees higher in summer and lower in winter.';
                    break;
                case 'Appliance':
                    tip = 'Make sure appliances are energy-efficient and used during off-peak hours.';
                    break;
                case 'Entertainment':
                    tip = 'Turn off devices when not in use.';
                    break;
                default:
                    tip = 'Monitor your usage and consider energy-efficient alternatives.';
            }
            this.showTip(device.name, tip);
        });
    }

    showAlert(title, message) {
        // Implement UI alert display
        console.log(title + ': ' + message);
    }

    showTip(deviceName, tip) {
        // Implement UI tip display
        console.log('Tip for ' + deviceName + ': ' + tip);
    }
}

// Initialize insights when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.energyInsights = new EnergyInsights();
});
