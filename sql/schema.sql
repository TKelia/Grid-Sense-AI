-- GridSenseAI Database Schema

-- Create the database if it doesn't exist
CREATE DATABASE IF NOT EXISTS gridsense_ai;
USE gridsense_ai;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL
);

-- Power usage records
CREATE TABLE IF NOT EXISTS power_usage (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    usage_kwh DECIMAL(10,2) NOT NULL,
    device_type VARCHAR(50),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- User preferences
CREATE TABLE IF NOT EXISTS user_preferences (
    user_id INT PRIMARY KEY,
    notification_enabled BOOLEAN DEFAULT true,
    daily_limit_kwh DECIMAL(10,2),
    theme VARCHAR(20) DEFAULT 'light',
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Energy saving tips
CREATE TABLE IF NOT EXISTS energy_tips (
    id INT PRIMARY KEY AUTO_INCREMENT,
    category VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tutorial videos
CREATE TABLE IF NOT EXISTS tutorial_videos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    youtube_id VARCHAR(20) NOT NULL,
    category ENUM('basics', 'tips', 'devices', 'ai', 'appliances', 'advanced') NOT NULL,
    duration VARCHAR(10),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert some sample energy tips
INSERT INTO energy_tips (category, title, content) VALUES
('lighting', 'Switch to LED Bulbs', 'Replace traditional incandescent bulbs with LED bulbs to save up to 75% on lighting costs.'),
('appliances', 'Smart Thermostat Usage', 'Program your thermostat to automatically adjust temperature during sleeping hours and when away from home.'),
('general', 'Standby Power Management', 'Use power strips to easily turn off multiple devices and eliminate standby power consumption.'),
('hvac', 'Regular HVAC Maintenance', 'Clean or replace your HVAC filters every 2-3 months to maintain efficiency and reduce energy waste.');

-- Insert sample tutorial videos
INSERT INTO tutorial_videos (title, description, youtube_id, category, duration) VALUES
('Understanding Your Power Usage', 'Learn how to interpret your power consumption data and make informed decisions.', '9EMU_SztXs4', 'basics', '5:30'),
('Energy Saving Tips', 'Practical tips to reduce your daily power consumption and save money.', 'N7yHZeJCD9c', 'tips', '4:45'),
('Smart Device Management', 'How to manage and optimize your connected devices for better efficiency.', '3V_VWHKZcDM', 'devices', '6:15'),
('Understanding AI Insights', 'Make the most of GridSenseAI\'s intelligent recommendations.', 'YqANqFrXNKw', 'ai', '7:00'),
('Home Energy Saving Tips', 'Simple tips to reduce your home\'s energy consumption', '9EMU_SztXs4', 'basics', '4:23'),
('Smart Appliance Energy Usage', 'Learn how to optimize your appliances\' energy consumption', 'N7yHZeJCD9c', 'appliances', '6:15'),
('Advanced Home Energy Monitoring', 'Set up a comprehensive home energy monitoring system', '3V_VWHKZcDM', 'advanced', '8:42'),
('Energy-Efficient Lighting Guide', 'Choose and use energy-efficient lighting solutions', 'YqANqFrXNKw', 'basics', '5:17');
