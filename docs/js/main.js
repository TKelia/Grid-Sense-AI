// Load Chart.js from CDN
document.addEventListener('DOMContentLoaded', function() {
    loadChartJS().then(() => {
        initializeDashboard();
    });
});

function loadChartJS() {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

function initializeDashboard() {
    // Sample data for the power usage chart
    const ctx = document.createElement('canvas');
    document.querySelector('.usage-chart').appendChild(ctx);

    const data = {
        labels: ['00:00', '03:00', '06:00', '09:00', '12:00', '15:00', '18:00', '21:00'],
        datasets: [{
            label: 'Power Usage (Watts)',
            data: [300, 250, 200, 450, 600, 500, 750, 400],
            borderColor: '#0066cc',
            backgroundColor: 'rgba(0, 102, 204, 0.1)',
            fill: true,
            tension: 0.4
        }]
    };

    const config = {
        type: 'line',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: 'Daily Power Consumption'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Power (Watts)'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Time'
                    }
                }
            }
        }
    };

    new Chart(ctx, config);
}

// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Sample notifications system
class NotificationSystem {
    constructor() {
        this.notifications = [];
    }

    addNotification(type, message) {
        const notification = {
            id: Date.now(),
            type,
            message,
            timestamp: new Date()
        };
        this.notifications.push(notification);
        this.showNotification(notification);
    }

    showNotification(notification) {
        const container = document.createElement('div');
        container.className = `notification ${notification.type}`;
        container.innerHTML = `
            <p>${notification.message}</p>
            <button onclick="this.parentElement.remove()">×</button>
        `;
        document.body.appendChild(container);
        setTimeout(() => container.remove(), 5000);
    }
}

// Initialize notification system
const notifications = new NotificationSystem();

// Sample usage (to be replaced with real data)
setTimeout(() => {
    notifications.addNotification('warning', 'Unusual power consumption detected in Living Room');
}, 3000);
