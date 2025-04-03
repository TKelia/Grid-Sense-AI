<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

require_once 'config.php';

class DeviceManager {
    private $conn;
    private $user_id;
    
    public function __construct($conn, $user_id) {
        $this->conn = $conn;
        $this->user_id = $user_id;
    }
    
    public function getDevices() {
        $query = "SELECT d.*, COALESCE(pr.power_usage, 0) as current_power
                 FROM devices d
                 LEFT JOIN (
                     SELECT device_id, power_usage
                     FROM power_readings
                     WHERE timestamp = (
                         SELECT MAX(timestamp)
                         FROM power_readings pr2
                         WHERE pr2.device_id = power_readings.device_id
                     )
                 ) pr ON d.id = pr.device_id
                 WHERE d.user_id = ?
                 ORDER BY d.name";
                 
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param("i", $this->user_id);
        $stmt->execute();
        $result = $stmt->get_result();
        
        $devices = [];
        while ($row = $result->fetch_assoc()) {
            $devices[] = $row;
        }
        
        return $devices;
    }
    
    public function addDevice($data) {
        $query = "INSERT INTO devices (user_id, name, type, max_power, location) 
                 VALUES (?, ?, ?, ?, ?)";
                 
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param("issds", 
            $this->user_id,
            $data['name'],
            $data['type'],
            $data['max_power'],
            $data['location']
        );
        
        if ($stmt->execute()) {
            return [
                'success' => true,
                'device_id' => $this->conn->insert_id
            ];
        }
        
        throw new Exception("Error adding device: " . $stmt->error);
    }
    
    public function removeDevice($device_id) {
        // First check if device belongs to user
        $query = "SELECT id FROM devices WHERE id = ? AND user_id = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param("ii", $device_id, $this->user_id);
        $stmt->execute();
        
        if ($stmt->get_result()->num_rows === 0) {
            throw new Exception("Device not found or access denied");
        }
        
        // Delete device and its readings
        $this->conn->begin_transaction();
        
        try {
            // Delete power readings
            $query = "DELETE FROM power_readings WHERE device_id = ?";
            $stmt = $this->conn->prepare($query);
            $stmt->bind_param("i", $device_id);
            $stmt->execute();
            
            // Delete device
            $query = "DELETE FROM devices WHERE id = ?";
            $stmt = $this->conn->prepare($query);
            $stmt->bind_param("i", $device_id);
            $stmt->execute();
            
            $this->conn->commit();
            return true;
            
        } catch (Exception $e) {
            $this->conn->rollback();
            throw $e;
        }
    }
}

// Handle the request
try {
    $conn = getConnection();
    
    // For testing, using user_id = 1. In production, get from session
    $user_id = 1;
    $manager = new DeviceManager($conn, $user_id);
    
    switch ($_SERVER['REQUEST_METHOD']) {
        case 'GET':
            $devices = $manager->getDevices();
            echo json_encode([
                'success' => true,
                'data' => $devices
            ]);
            break;
            
        case 'POST':
            $data = json_decode(file_get_contents('php://input'), true);
            $result = $manager->addDevice($data);
            echo json_encode([
                'success' => true,
                'data' => $result
            ]);
            break;
            
        case 'DELETE':
            $device_id = $_GET['id'] ?? null;
            if (!$device_id) {
                throw new Exception("Device ID is required");
            }
            
            $manager->removeDevice($device_id);
            echo json_encode([
                'success' => true,
                'message' => 'Device removed successfully'
            ]);
            break;
            
        case 'OPTIONS':
            http_response_code(200);
            break;
            
        default:
            throw new Exception("Method not allowed");
    }
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
