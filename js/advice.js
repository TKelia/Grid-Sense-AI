class EnergyAdvisor {
    constructor() {
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

    init() {
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

// Initialize advisor when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.energyAdvisor = new EnergyAdvisor();
});
