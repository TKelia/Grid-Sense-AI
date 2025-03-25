# GridSenseAI - Smart Energy Monitoring Solution

A modern, AI-powered home energy monitoring solution that helps users track and optimize their energy consumption through real-time monitoring, intelligent insights, and educational resources.

## 🌟 Features

- **Authentication System**
  - Secure user registration and login
  - Password encryption
  - Session management
  - User preferences storage

- **Power Usage Dashboard**
  - Real-time energy consumption monitoring
  - Device-specific tracking
  - Historical data visualization
  - Interactive charts and graphs

- **AI-Powered Insights**
  - Smart consumption patterns analysis
  - Energy-saving recommendations
  - Anomaly detection
  - Cost optimization suggestions

- **Notifications & Alerts**
  - Real-time usage alerts
  - Customizable thresholds
  - Email notifications
  - In-app messaging system

- **Video Tutorials**
  - Educational content
  - Energy-saving tips
  - Device optimization guides
  - Best practices

## 🛠️ Tech Stack

### Frontend
- HTML5
- CSS3 (with modern Flexbox/Grid layouts)
- JavaScript (ES6+)
- Chart.js for data visualization
- Font Awesome for icons
- Google Fonts (Inter)

### Backend
- PHP 8.2+
- MySQL 8.0+
- Apache 2.4+

### Development Tools
- XAMPP v8.2.12
- Git for version control
- Visual Studio Code (recommended)

## 📁 Project Structure

```
GridSenseAI/
├── css/                  # Stylesheet files
│   ├── styles.css       # Global styles
│   ├── auth.css        # Authentication styles
│   └── dashboard.css   # Dashboard styles
├── js/                  # JavaScript files
│   ├── main.js         # Main JavaScript file
│   ├── auth.js         # Authentication logic
│   ├── dashboard.js    # Dashboard functionality
│   ├── advice.js       # AI insights logic
│   ├── notifications.js # Notification system
│   └── tutorials.js    # Video tutorials handling
├── php/                 # PHP backend files
│   ├── config.php      # Database configuration
│   ├── auth.php        # Authentication endpoints
│   └── power.php       # Power usage endpoints
├── sql/                 # Database files
│   └── schema.sql      # Database schema
├── .htaccess           # Apache configuration
├── index.html          # Landing page
├── dashboard.html      # Dashboard interface
├── login.html          # Login page
└── 404.html            # Error page

```

## 🚀 Installation & Setup

1. **Prerequisites**
   - XAMPP (or similar PHP development environment)
   - Git
   - Web browser (Chrome/Firefox recommended)

2. **Installation Steps**
   ```bash
   # Clone the repository
   git clone https://github.com/yourusername/GridSenseAI.git

   # Move to XAMPP htdocs directory
   mv GridSenseAI /path/to/xampp/htdocs/

   # Start XAMPP services
   # - Start Apache
   # - Start MySQL
   ```

3. **Database Setup**
   - Open phpMyAdmin (http://localhost/phpmyadmin)
   - Create a new database named 'gridsense_ai'
   - Import the schema from `sql/schema.sql`

4. **Configuration**
   - Update database credentials in `php/config.php`
   - Ensure Apache mod_rewrite is enabled
   - Verify .htaccess is properly configured

5. **Access the Website**
   - Visit http://localhost/GridSenseAI
   - Default test credentials:
     - Username: demo@gridsense.ai
     - Password: demo123

## 🎨 Brand Guidelines

### Colors
- Marine Blue: #1a237e (Primary)
- White: #ffffff (Background)
- Light Gray: #f5f5f5 (Secondary Background)
- Green: #00b894 (Accents)

### Typography
- Primary Font: Inter (Google Fonts)
- Weights: 400 (regular), 500 (medium), 600 (semibold), 700 (bold)

## 🔧 Development

### Code Standards
- HTML: Semantic markup
- CSS: BEM methodology
- JavaScript: ES6+ standards
- PHP: PSR-4 coding standards

### Best Practices
- Mobile-first responsive design
- Progressive enhancement
- Cross-browser compatibility
- Accessibility compliance

## 🌐 API Endpoints

### Authentication
- POST `/api/auth/login` - User login
- POST `/api/auth/register` - New user registration
- POST `/api/auth/logout` - User logout

### Power Usage
- GET `/api/power/usage` - Get current power usage
- GET `/api/power/history` - Get historical data
- POST `/api/power/threshold` - Set usage thresholds

## 📈 Current Status

- ✅ Project structure setup
- ✅ Landing page implementation
- ✅ Database schema design
- ✅ Authentication system
- ⏳ Power usage dashboard (In Progress)
- ⏳ AI insights integration
- ⏳ Notification system
- ⏳ Video tutorials section

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Team

- Tesi - Project Lead & Developer

## 📞 Support

For support, please email support@gridsense.ai or create an issue in the repository.

---

Made with ❤️ by the GridSenseAI Team
