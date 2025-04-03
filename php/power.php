<?php
require_once 'config.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

function jsonResponse($success, $data = null, $message = '') {
    echo json_encode([
        'success' => $success,
        'data' => $data,
        'message' => $message
    ]);
    exit;
}

// Get power readings for a specific device or all devices
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $conn = getDBConnection();
    
    $device_id = isset($_GET['device_id']) ? (int)$_GET['device_id'] : null;
    $timeframe = isset($_GET['timeframe']) ? sanitizeInput($conn, $_GET['timeframe']) : 'day';
    
    $query = "SELECT pr.*, d.device_name, d.device_type 
              FROM power_readings pr
              JOIN devices d ON pr.device_id = d.device_id
              WHERE 1=1 ";
    
    if ($device_id) {
        $query .= "AND pr.device_id = $device_id ";
    }
    
    switch($timeframe) {
        case 'hour':
            $query .= "AND pr.timestamp >= DATE_SUB(NOW(), INTERVAL 1 HOUR)";
            break;
        case 'day':
            $query .= "AND pr.timestamp >= DATE_SUB(NOW(), INTERVAL 1 DAY)";
            break;
        case 'week':
            $query .= "AND pr.timestamp >= DATE_SUB(NOW(), INTERVAL 1 WEEK)";
            break;
        case 'month':
            $query .= "AND pr.timestamp >= DATE_SUB(NOW(), INTERVAL 1 MONTH)";
            break;
    }
    
    $query .= " ORDER BY pr.timestamp DESC";
    $result = $conn->query($query);
    
    if ($result) {
        $readings = [];
        while ($row = $result->fetch_assoc()) {
            $readings[] = $row;
        }
        jsonResponse(true, $readings);
    } else {
        jsonResponse(false, null, "Error fetching power readings: " . $conn->error);
    }
}

// Add new power reading
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $conn = getDBConnection();
    
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($data['device_id']) || !isset($data['power_usage'])) {
        jsonResponse(false, null, "Missing required fields");
    }
    
    $device_id = (int)$data['device_id'];
    $power_usage = (float)$data['power_usage'];
    $voltage = isset($data['voltage']) ? (float)$data['voltage'] : null;
    $current = isset($data['current']) ? (float)$data['current'] : null;
    
    $query = "INSERT INTO power_readings (device_id, power_usage, voltage, current) 
              VALUES (?, ?, ?, ?)";
              
    $stmt = $conn->prepare($query);
    $stmt->bind_param("iddd", $device_id, $power_usage, $voltage, $current);
    
    if ($stmt->execute()) {
        jsonResponse(true, ['reading_id' => $conn->insert_id]);
    } else {
        jsonResponse(false, null, "Error adding power reading: " . $stmt->error);
    }
}
?>
