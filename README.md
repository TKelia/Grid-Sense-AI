# GridSenseAI - Smart Energy Monitoring Solution

GridSenseAI is an AI-powered home energy monitoring solution that helps users track and optimize their power consumption. The system provides real-time monitoring of connected devices, intelligent insights, and energy-saving recommendations.

![GridSenseAI Dashboard](screenshots/dashboard.png)

## Features

- **Real-time Device Monitoring**
  - Track power consumption of connected devices
  - Visual power usage gauges
  - Historical usage data with charts
  - Device management (add/remove devices)

- **AI-Powered Insights**
  - Smart recommendations for energy savings
  - Usage pattern analysis
  - Anomaly detection
  - Cost-saving opportunities

- **Credit Monitoring**
  - Set custom alert thresholds
  - Low credit notifications
  - Usage forecasting
  - Credit management

- **Educational Resources**
  - Energy-saving tutorials
  - Video guides
  - Best practices
  - Tips and tricks

## Tech Stack

- **Frontend**
  - HTML5
  - CSS3 (with Flexbox and Grid)
  - JavaScript (ES6+)
  - Chart.js for data visualization

- **Backend**
  - PHP 7.4+
  - MySQL Database
  - WebSocket for real-time updates

- **Dependencies**
  - Font Awesome 6.0.0
  - Chart.js
  - Google Fonts (Inter)

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/GridSenseAI.git
   ```

2. Set up XAMPP:
   - Install XAMPP
   - Move the project to `htdocs` directory
   - Start Apache and MySQL services

3. Database setup:
   ```sql
   CREATE DATABASE gridsense;
   USE gridsense;
   -- Import the database.sql file
   ```

4. Configure the application:
   - Update database credentials in `php/config.php`
   - Set up WebSocket server (if required)

5. Access the application:
   - Open `http://localhost/GridSenseAI` in your browser
   - Default login: admin/admin123

## Project Structure

```
GridSenseAI/
├── css/                  # Stylesheets
│   ├── auth.css         # Authentication styles
│   ├── dashboard.css    # Dashboard styles
│   └── styles.css       # Common styles
├── js/                  # JavaScript files
│   ├── auth.js         # Authentication logic
│   ├── dashboard.js    # Dashboard functionality
│   ├── main.js        # Main application logic
│   └── ...
├── php/                # Backend files
│   ├── auth.php       # Authentication handlers
│   ├── config.php     # Configuration
│   └── power.php      # Power monitoring logic
├── screenshots/        # Project screenshots
├── index.html         # Landing page
├── dashboard.html     # Main dashboard
├── login.html         # Login page
└── README.md          # Documentation
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Icons by Font Awesome
- Charts powered by Chart.js
- Fonts by Google Fonts

## Contact

Your Name - [@yourusername](https://twitter.com/yourusername)
Project Link: [https://github.com/yourusername/GridSenseAI](https://github.com/yourusername/GridSenseAI)
