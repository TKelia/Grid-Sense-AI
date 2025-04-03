<?php
// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('error_log', 'C:/xampp/htdocs/GridSenseAI/logs/php_error.log');

// Database configuration
define('DB_HOST', 'sql303.infinityfree.com');  // InfinityFree MySQL host
define('DB_NAME', 'if0_38660381_gridsense');   // Your database name
define('DB_USER', 'if0_38660381');             // Your database username
define('DB_PASS', 'H1cWctQywv');              // Your database password

// Create database connection
function getDBConnection() {
    try {
        $conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
        
        if ($conn->connect_error) {
            error_log("Database connection failed: " . $conn->connect_error);
            throw new Exception("Connection failed: " . $conn->connect_error);
        }
        
        // Set charset to utf8mb4
        if (!$conn->set_charset("utf8mb4")) {
            error_log("Error setting charset: " . $conn->error);
        }
        
        return $conn;
    } catch (Exception $e) {
        error_log("Database connection error: " . $e->getMessage());
        return null;
    }
}

// Helper function to sanitize input
function sanitizeInput($conn, $input) {
    if (is_array($input)) {
        return array_map(function($item) use ($conn) {
            return $conn->real_escape_string($item);
        }, $input);
    }
    return $conn->real_escape_string($input);
}

// Site URL
define('SITE_URL', 'http://gridsenseai.kesug.com');  // Changed from https to http

// Other constants
define('POWER_THRESHOLD', 1000);  // Default power threshold in watts
define('CREDIT_THRESHOLD', 100);  // Default credit threshold in currency units

// Removed jsonResponse function since it's defined in power.php
?>
