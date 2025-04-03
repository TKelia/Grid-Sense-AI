// Constants
const API_BASE_URL = 'http://localhost/GridSenseAI/php';
const CHART_COLORS = {
    primary: '#1a237e',
    secondary: '#00b894',
    accent: '#00cec9',
    warning: '#fdcb6e',
    danger: '#d63031'
};

// Chart.js default configuration
Chart.defaults.color = '#2d3436';
Chart.defaults.font.family = 'Inter, sans-serif';

// Utility functions
const formatPower = (watts) => {
    if (watts >= 1000) {
        return `${(watts / 1000).toFixed(2)} kW`;
    }
    return `${watts.toFixed(0)} W`;
};

const formatDate = (date) => {
    return new Date(date).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
    });
};

// Power usage chart
let powerUsageChart = null;
const initPowerUsageChart = (data) => {
    const ctx = document.getElementById('dailyUsageChart').getContext('2d');
    
    if (powerUsageChart) {
        powerUsageChart.destroy();
    }
    
    powerUsageChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.map(d => formatDate(d.timestamp)),
            datasets: [{
                label: 'Power Usage (W)',
                data: data.map(d => d.power_usage),
                borderColor: CHART_COLORS.primary,
                backgroundColor: CHART_COLORS.primary + '20',
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
                    ticks: {
                        callback: value => formatPower(value)
                    }
                }
            }
        }
    });
};

// Peak hours chart
let peakHoursChart = null;
const initPeakHoursChart = (data) => {
    const ctx = document.getElementById('peakHoursChart').getContext('2d');
    
    if (peakHoursChart) {
        peakHoursChart.destroy();
    }
    
    const hourlyData = Array(24).fill(0);
    data.forEach(reading => {
        const hour = new Date(reading.timestamp).getHours();
        hourlyData[hour] += reading.power_usage;
    });
    
    peakHoursChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Array.from({length: 24}, (_, i) => `${i}:00`),
            datasets: [{
                label: 'Average Power Usage',
                data: hourlyData,
                backgroundColor: CHART_COLORS.secondary
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
                    ticks: {
                        callback: value => formatPower(value)
                    }
                }
            }
        }
    });
};

// Fetch and update data
const updateDashboard = async () => {
    try {
        // Fetch power readings
        const response = await fetch(`${API_BASE_URL}/power.php?timeframe=day`);
        const result = await response.json();
        
        if (!result.success) {
            throw new Error(result.message);
        }
        
        const readings = result.data;
        
        // Update total power
        const latestReadings = {};
        readings.forEach(reading => {
            if (!latestReadings[reading.device_id] || 
                new Date(reading.timestamp) > new Date(latestReadings[reading.device_id].timestamp)) {
                latestReadings[reading.device_id] = reading;
            }
        });
        
        const totalPower = Object.values(latestReadings)
            .reduce((sum, reading) => sum + parseFloat(reading.power_usage), 0);
        
        document.getElementById('totalPower').textContent = formatPower(totalPower);
        
        // Update charts
        initPowerUsageChart(readings);
        initPeakHoursChart(readings);
        
        // Update devices list
        const devicesList = document.getElementById('devicesList');
        devicesList.innerHTML = '';
        
        Object.values(latestReadings).forEach(device => {
            const deviceCard = document.createElement('div');
            deviceCard.className = 'device-card';
            deviceCard.innerHTML = `
                <div class="device-info">
                    <h3>${device.device_name}</h3>
                    <span class="device-type">${device.device_type}</span>
                </div>
                <div class="device-power">
                    <span class="power-value">${formatPower(device.power_usage)}</span>
                    <span class="power-label">Current Usage</span>
                </div>
            `;
            devicesList.appendChild(deviceCard);
        });
        
        // Update timestamp
        document.getElementById('lastUpdate').textContent = formatDate(new Date());
        
    } catch (error) {
        console.error('Error updating dashboard:', error);
        // Show error notification
    }
};

// Device Management and Real-time Monitoring
let devices = [];
let powerUsageData = {};
let remainingCredit = 1000; // Example initial credit in kWh

// WebSocket connection for real-time updates
const ws = new WebSocket('ws://localhost:8080');

ws.onmessage = function(event) {
    const data = JSON.parse(event.data);
    if (data.type === 'power_update') {
        updateDevicePower(data.device_id, data.power_usage);
    } else if (data.type === 'credit_update') {
        updateRemainingCredit(data.credit);
    }
};

// Device images mapping
const deviceImages = {
    'Smart TV': 'https://img.icons8.com/color/96/000000/tv.png',
    'Refrigerator': 'https://img.icons8.com/color/96/000000/fridge.png',
    'Microwave': 'https://img.icons8.com/color/96/000000/microwave.png',
    'default': 'https://img.icons8.com/color/96/000000/electronic-device.png'
};

// Store power history for each device
const powerHistory = new Map();
const MAX_HISTORY_POINTS = 24; // Keep 24 data points (2 minutes of data)

// Initialize the dashboard
document.addEventListener('DOMContentLoaded', function() {
    // Initialize pre-connected devices
    const preConnectedDevices = [
        {
            id: 1,
            name: 'Smart TV',
            type: 'Electronics',
            location: 'Living Room',
            power: 70,
            maxPower: 200
        },
        {
            id: 2,
            name: 'Refrigerator',
            type: 'Appliance',
            location: 'Kitchen',
            power: 150,
            maxPower: 250
        },
        {
            id: 3,
            name: 'Microwave',
            type: 'Appliance',
            location: 'Kitchen',
            power: 900,
            maxPower: 2000
        }
    ];

    // Add pre-connected devices to the list
    preConnectedDevices.forEach(device => {
        // Initialize power history for each device
        powerHistory.set(device.id, [{
            time: new Date(),
            power: device.power
        }]);
        addDeviceToList(device);
    });

    // Start real-time updates
    startRealtimeUpdates();
});

// Add device to the list
function addDeviceToList(device) {
    const devicesList = document.getElementById('devicesList');
    
    const deviceCard = document.createElement('div');
    deviceCard.className = 'device-card';
    deviceCard.id = `device-${device.id}`;
    
    const powerPercentage = (device.power / device.maxPower) * 100;
    const deviceImage = deviceImages[device.name] || deviceImages.default;
    
    deviceCard.innerHTML = `
        <div class="device-header">
            <h3>${device.name}</h3>
            <button class="btn-icon" onclick="removeDevice(${device.id})">
                <i class="fas fa-trash"></i>
            </button>
        </div>
        <div class="device-content">
            <div class="device-image">
                <img src="${deviceImage}" alt="${device.name}" width="64" height="64">
            </div>
            <div class="device-info">
                <p><i class="fas ${getDeviceIcon(device.type)}"></i> ${device.type}</p>
                <p><i class="fas fa-map-marker-alt"></i> ${device.location}</p>
            </div>
        </div>
        <div class="device-power">
            <div class="power-stats">
                <div class="current-power">
                    <span class="label">Current Power:</span>
                    <span id="power-${device.id}" class="value">${device.power}W</span>
                </div>
                <div class="max-power">
                    <span class="label">Max Power:</span>
                    <span class="value">${device.maxPower}W</span>
                </div>
            </div>
            <div class="power-gauge">
                <div class="power-bar" style="width: ${powerPercentage}%"></div>
            </div>
        </div>
        <div class="device-chart">
            <canvas id="chart-${device.id}"></canvas>
        </div>
        <div class="device-stats">
            <div class="stat">
                <span class="label">Daily Avg:</span>
                <span id="daily-avg-${device.id}" class="value">-</span>
            </div>
            <div class="stat">
                <span class="label">Peak Today:</span>
                <span id="peak-${device.id}" class="value">-</span>
            </div>
        </div>
    `;
    
    devicesList.appendChild(deviceCard);
    initializeDeviceChart(device.id);
}

// Initialize chart for a device
function initializeDeviceChart(deviceId) {
    const ctx = document.getElementById(`chart-${deviceId}`).getContext('2d');
    const chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Power Usage (W)',
                data: [],
                borderColor: '#00b894',
                backgroundColor: 'rgba(0, 184, 148, 0.1)',
                tension: 0.4,
                fill: true,
                pointRadius: 0,
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
                duration: 750,
                easing: 'easeInOutQuart'
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    backgroundColor: 'rgba(26, 35, 126, 0.9)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    titleFont: {
                        size: 13,
                        weight: 600
                    },
                    bodyFont: {
                        size: 12
                    },
                    padding: 10,
                    displayColors: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        display: false
                    },
                    ticks: {
                        maxTicksLimit: 5,
                        font: {
                            size: 10
                        }
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        maxTicksLimit: 4,
                        maxRotation: 0,
                        font: {
                            size: 10
                        }
                    }
                }
            },
            interaction: {
                intersect: false,
                mode: 'nearest'
            }
        }
    });
    
    // Store chart instance
    powerHistory.get(deviceId).chart = chart;
}

// Update device chart
function updateDeviceChart(deviceId, power) {
    const history = powerHistory.get(deviceId);
    if (!history) return;

    const now = new Date();
    history.push({
        time: now,
        power: power
    });

    // Keep only last MAX_HISTORY_POINTS entries
    if (history.length > MAX_HISTORY_POINTS) {
        history.shift();
    }

    // Update chart
    const chart = history.chart;
    if (chart) {
        chart.data.labels = history.map(h => h.time.toLocaleTimeString());
        chart.data.datasets[0].data = history.map(h => h.power);
        chart.update('quiet');
    }

    // Update statistics
    updateDeviceStats(deviceId, history);
}

// Update device statistics
function updateDeviceStats(deviceId, history) {
    const dailyAvg = history.reduce((sum, h) => sum + h.power, 0) / history.length;
    const peak = Math.max(...history.map(h => h.power));

    document.getElementById(`daily-avg-${deviceId}`).textContent = `${Math.round(dailyAvg)}W`;
    document.getElementById(`peak-${deviceId}`).textContent = `${Math.round(peak)}W`;
}

// Simulate real-time power updates
function startRealtimeUpdates() {
    setInterval(() => {
        document.querySelectorAll('.device-card').forEach(card => {
            const id = card.id.split('-')[1];
            const powerSpan = document.getElementById(`power-${id}`);
            const powerBar = card.querySelector('.power-bar');
            
            if (powerSpan && powerBar) {
                // Simulate power fluctuation (±10%)
                const currentPower = parseFloat(powerSpan.textContent);
                const fluctuation = currentPower * 0.1;
                const newPower = Math.max(0, currentPower + (Math.random() * fluctuation * 2 - fluctuation));
                
                powerSpan.textContent = `${Math.round(newPower)}W`;
                
                // Update power gauge
                const maxPower = getMaxPower(id);
                const percentage = (newPower / maxPower) * 100;
                powerBar.style.width = `${percentage}%`;
                
                // Update chart and stats
                updateDeviceChart(parseInt(id), newPower);
                
                // Update total power usage
                updateTotalPowerUsage();
            }
        });
    }, 5000); // Update every 5 seconds
}

// Get appropriate icon for device type
function getDeviceIcon(type) {
    switch(type.toLowerCase()) {
        case 'electronics':
            return 'fa-tv';
        case 'appliance':
            return 'fa-plug';
        case 'lighting':
            return 'fa-lightbulb';
        case 'hvac':
            return 'fa-snowflake';
        default:
            return 'fa-plug';
    }
}

// Remove device
function removeDevice(deviceId) {
    if (confirm('Are you sure you want to remove this device?')) {
        const device = document.getElementById(`device-${deviceId}`);
        if (device) {
            device.remove();
            updateTotalPowerUsage();
        }
    }
}

// Update total power usage
function updateTotalPowerUsage() {
    const totalPower = Array.from(document.querySelectorAll('.power-reading span'))
        .reduce((sum, span) => sum + parseFloat(span.textContent), 0);
    
    const totalElement = document.getElementById('totalPower');
    if (totalElement) {
        totalElement.textContent = Math.round(totalPower);
    }
}

// Modal functions
function openAddDeviceModal() {
    const modal = document.getElementById('addDeviceModal');
    if (modal) {
        modal.style.display = 'flex';
    }
}

function closeAddDeviceModal() {
    const modal = document.getElementById('addDeviceModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Add new device
function addDevice(event) {
    event.preventDefault();
    
    const name = document.getElementById('deviceName').value;
    const type = document.getElementById('deviceType').value;
    const maxPower = parseFloat(document.getElementById('maxPower').value);
    const location = document.getElementById('location').value;
    
    const newDevice = {
        id: Date.now(), // Use timestamp as unique ID
        name,
        type,
        location,
        power: 0,
        maxPower
    };
    
    addDeviceToList(newDevice);
    closeAddDeviceModal();
    
    // Reset form
    event.target.reset();
    
    return false;
}

// Credit Monitoring and Alerts
function updateRemainingCredit(credit) {
    remainingCredit = credit;
    document.getElementById('remainingCredit').textContent = credit.toFixed(2);
    
    // Get user's custom threshold
    const threshold = parseFloat(document.getElementById('creditThreshold').textContent);
    
    // Check for low credit
    if (credit <= threshold) {
        showLowCreditAlert(credit);
    }
}

function showLowCreditAlert(credit) {
    const alertModal = document.getElementById('alertModal');
    const alertMessage = document.getElementById('alertMessage');
    
    alertMessage.innerHTML = `
        Your remaining power credit is running low!<br>
        Current balance: ${credit.toFixed(2)} kWh<br>
        Please top up soon to avoid service interruption.
    `;
    
    alertModal.style.display = 'flex';
}

function closeAlertModal() {
    document.getElementById('alertModal').style.display = 'none';
}

function viewUsageDetails() {
    // Navigate to detailed usage view
    window.location.href = 'usage-details.html';
}

// Credit Settings Management
function openCreditSettingsModal() {
    const modal = document.getElementById('creditSettingsModal');
    const input = document.getElementById('alertThreshold');
    const currentThreshold = document.getElementById('creditThreshold').textContent;
    
    input.value = currentThreshold;
    modal.style.display = 'flex';
}

function closeCreditSettingsModal() {
    document.getElementById('creditSettingsModal').style.display = 'none';
}

async function updateCreditSettings(event) {
    event.preventDefault();
    
    const threshold = document.getElementById('alertThreshold').value;
    
    try {
        const response = await fetch(`${API_BASE_URL}/credit.php`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                threshold: parseFloat(threshold)
            })
        });
        
        const result = await response.json();
        if (result.success) {
            document.getElementById('creditThreshold').textContent = threshold;
            closeCreditSettingsModal();
            showNotification('Alert threshold updated successfully', 'success');
        } else {
            throw new Error(result.message);
        }
    } catch (error) {
        showNotification('Error updating threshold: ' + error.message, 'error');
    }
}

// Notifications
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}
