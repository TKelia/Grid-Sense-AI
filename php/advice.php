<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
require_once 'config.php';

class EnergyAdvisor {
    private $conn;
    private $user_id;

    public function __construct($conn, $user_id) {
        $this->conn = $conn;
        $this->user_id = $user_id;
    }

    public function generateInsights() {
        $insights = [];
        
        // Get power usage data
        $powerData = $this->getPowerData();
        
        // Generate different types of insights
        $insights = array_merge(
            $insights,
            $this->analyzePeakHours($powerData),
            $this->analyzeDeviceEfficiency($powerData),
            $this->analyzeHVACUsage($powerData),
            $this->generateGeneralTips()
        );
        
        return $insights;
    }

    private function getPowerData() {
        $query = "SELECT device_id, timestamp, power_usage 
                 FROM power_readings 
                 WHERE user_id = ? 
                 AND timestamp >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
                 ORDER BY timestamp DESC";
                 
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param("i", $this->user_id);
        $stmt->execute();
        $result = $stmt->get_result();
        
        $powerData = [];
        while ($row = $result->fetch_assoc()) {
            $powerData[] = $row;
        }
        
        return $powerData;
    }

    private function analyzePeakHours($powerData) {
        $insights = [];
        
        // Group data by hour and calculate average usage
        $hourlyUsage = [];
        foreach ($powerData as $reading) {
            $hour = date('H', strtotime($reading['timestamp']));
            if (!isset($hourlyUsage[$hour])) {
                $hourlyUsage[$hour] = ['total' => 0, 'count' => 0];
            }
            $hourlyUsage[$hour]['total'] += $reading['power_usage'];
            $hourlyUsage[$hour]['count']++;
        }
        
        // Find peak hours (top 20% of usage)
        arsort($hourlyUsage);
        $peakHours = array_slice($hourlyUsage, 0, ceil(count($hourlyUsage) * 0.2), true);
        
        if (!empty($peakHours)) {
            $peakHoursList = implode('-', array_keys($peakHours));
            $insights[] = [
                'type' => 'peak_hours',
                'title' => 'Peak Usage Hours Detected',
                'description' => "Your energy usage peaks between {$peakHoursList}. Consider shifting some activities to off-peak hours for cost savings.",
                'impact' => 'high',
                'potential_saving' => '$30-50/month'
            ];
        }
        
        return $insights;
    }

    private function analyzeDeviceEfficiency($powerData) {
        $insights = [];
        
        // Get devices with high power consumption
        $query = "SELECT d.device_name, AVG(pr.power_usage) as avg_usage
                 FROM power_readings pr
                 JOIN devices d ON pr.device_id = d.id
                 WHERE pr.user_id = ?
                 GROUP BY d.id
                 HAVING avg_usage > 1000
                 ORDER BY avg_usage DESC
                 LIMIT 3";
                 
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param("i", $this->user_id);
        $stmt->execute();
        $result = $stmt->get_result();
        
        while ($device = $result->fetch_assoc()) {
            $insights[] = [
                'type' => 'device_efficiency',
                'title' => "High Usage: {$device['device_name']}",
                'description' => "Your {$device['device_name']} is consuming more power than average. Consider upgrading to an energy-efficient model.",
                'impact' => 'medium',
                'potential_saving' => '$15-25/month'
            ];
        }
        
        return $insights;
    }

    private function analyzeHVACUsage($powerData) {
        $insights = [];
        
        // Get HVAC usage patterns
        $query = "SELECT AVG(power_usage) as avg_usage
                 FROM power_readings pr
                 JOIN devices d ON pr.device_id = d.id
                 WHERE pr.user_id = ? AND d.device_type = 'HVAC'
                 AND timestamp >= DATE_SUB(NOW(), INTERVAL 24 HOUR)";
                 
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param("i", $this->user_id);
        $stmt->execute();
        $result = $stmt->get_result();
        $hvacData = $result->fetch_assoc();
        
        if ($hvacData && $hvacData['avg_usage'] > 2000) {
            $insights[] = [
                'type' => 'hvac_optimization',
                'title' => 'HVAC Efficiency Alert',
                'description' => 'Your HVAC system is running at high power. Consider setting the thermostat 2°F higher in summer or lower in winter to save energy.',
                'impact' => 'high',
                'potential_saving' => '$40-60/month'
            ];
        }
        
        return $insights;
    }

    private function generateGeneralTips() {
        // Get random energy-saving tips from the database
        $query = "SELECT * FROM energy_tips 
                 WHERE NOT EXISTS (
                     SELECT 1 FROM shown_tips 
                     WHERE shown_tips.tip_id = energy_tips.id 
                     AND shown_tips.user_id = ?
                     AND shown_tips.shown_at > DATE_SUB(NOW(), INTERVAL 7 DAY)
                 )
                 ORDER BY RAND()
                 LIMIT 2";
                 
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param("i", $this->user_id);
        $stmt->execute();
        $result = $stmt->get_result();
        
        $insights = [];
        while ($tip = $result->fetch_assoc()) {
            $insights[] = [
                'type' => 'general_tip',
                'title' => $tip['title'],
                'description' => $tip['description'],
                'impact' => $tip['impact_level'],
                'potential_saving' => $tip['estimated_saving']
            ];
            
            // Mark tip as shown
            $insertQuery = "INSERT INTO shown_tips (user_id, tip_id, shown_at) VALUES (?, ?, NOW())";
            $insertStmt = $this->conn->prepare($insertQuery);
            $insertStmt->bind_param("ii", $this->user_id, $tip['id']);
            $insertStmt->execute();
        }
        
        return $insights;
    }
}

// Handle the request
try {
    $conn = getConnection();
    
    // For testing, using user_id = 1. In production, get from session
    $user_id = 1;
    
    $advisor = new EnergyAdvisor($conn, $user_id);
    $insights = $advisor->generateInsights();
    
    echo json_encode([
        'success' => true,
        'data' => $insights
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error generating insights: ' . $e->getMessage()
    ]);
}
