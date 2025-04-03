<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
require_once 'config.php';

class CreditMonitor {
    private $conn;
    private $user_id;
    
    public function __construct($conn, $user_id) {
        $this->conn = $conn;
        $this->user_id = $user_id;
    }
    
    public function getRemainingCredit() {
        // Get user's current credit balance and threshold
        $query = "SELECT credit_balance, credit_threshold 
                 FROM users 
                 WHERE id = ?";
                 
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param("i", $this->user_id);
        $stmt->execute();
        $result = $stmt->get_result();
        $user = $result->fetch_assoc();
        
        if (!$user) {
            throw new Exception("User not found");
        }
        
        // Get total power usage for current billing cycle
        $query = "SELECT SUM(power_usage * duration_hours * rate) as total_cost
                 FROM power_readings pr
                 JOIN devices d ON pr.device_id = d.id
                 WHERE pr.user_id = ?
                 AND pr.timestamp >= DATE_SUB(NOW(), INTERVAL 30 DAY)";
                 
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param("i", $this->user_id);
        $stmt->execute();
        $result = $stmt->get_result();
        $usage = $result->fetch_assoc();
        
        $remaining_credit = $user['credit_balance'] - ($usage['total_cost'] ?? 0);
        
        // Check if below threshold and create notification if needed
        if ($remaining_credit <= $user['credit_threshold'] && $remaining_credit > 0) {
            $this->createLowCreditNotification($remaining_credit);
        }
        
        return [
            'credit' => $remaining_credit,
            'threshold' => $user['credit_threshold'],
            'billing_cycle_end' => date('Y-m-d', strtotime('+30 days'))
        ];
    }
    
    public function updateCreditThreshold($threshold) {
        if ($threshold < 10 || $threshold > 1000) {
            throw new Exception("Threshold must be between 10 and 1000 kWh");
        }
        
        $query = "UPDATE users 
                 SET credit_threshold = ?
                 WHERE id = ?";
                 
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param("di", $threshold, $this->user_id);
        
        if (!$stmt->execute()) {
            throw new Exception("Error updating threshold: " . $stmt->error);
        }
        
        return [
            'threshold' => $threshold,
            'message' => 'Threshold updated successfully'
        ];
    }
    
    private function createLowCreditNotification($remaining_credit) {
        $query = "INSERT INTO notifications (user_id, type, message, created_at)
                 VALUES (?, 'low_credit', ?, NOW())";
                 
        $message = "Your remaining power credit is low: " . number_format($remaining_credit, 2) . " kWh";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param("is", $this->user_id, $message);
        $stmt->execute();
    }
    
    public function getNotifications() {
        $query = "SELECT * FROM notifications 
                 WHERE user_id = ? 
                 AND created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
                 ORDER BY created_at DESC";
                 
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param("i", $this->user_id);
        $stmt->execute();
        $result = $stmt->get_result();
        
        $notifications = [];
        while ($row = $result->fetch_assoc()) {
            $notifications[] = $row;
        }
        
        return $notifications;
    }
}

// Handle the request
try {
    $conn = getConnection();
    
    // For testing, using user_id = 1. In production, get from session
    $user_id = 1;
    $monitor = new CreditMonitor($conn, $user_id);
    
    switch ($_SERVER['REQUEST_METHOD']) {
        case 'GET':
            $credit_info = $monitor->getRemainingCredit();
            echo json_encode([
                'success' => true,
                'data' => $credit_info
            ]);
            break;
            
        case 'POST':
            $data = json_decode(file_get_contents('php://input'), true);
            if (!isset($data['threshold'])) {
                throw new Exception("Threshold value is required");
            }
            
            $result = $monitor->updateCreditThreshold($data['threshold']);
            echo json_encode([
                'success' => true,
                'data' => $result
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
