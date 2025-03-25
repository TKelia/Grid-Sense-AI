<?php
require_once 'config.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST');

$request_method = $_SERVER['REQUEST_METHOD'];
$request_path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// Simulated device data (in production, this would come from real sensors)
$devices = [
    ['id' => 1, 'name' => 'Living Room TV', 'type' => 'entertainment', 'usage' => rand(60, 120)],
    ['id' => 2, 'name' => 'Kitchen Refrigerator', 'type' => 'appliance', 'usage' => rand(100, 200)],
    ['id' => 3, 'name' => 'Bedroom AC', 'type' => 'hvac', 'usage' => rand(800, 1500)],
    ['id' => 4, 'name' => 'Washing Machine', 'type' => 'appliance', 'usage' => rand(400, 600)],
    ['id' => 5, 'name' => 'Home Office PC', 'type' => 'electronics', 'usage' => rand(200, 350)],
    ['id' => 6, 'name' => 'Kitchen Microwave', 'type' => 'appliance', 'usage' => rand(600, 1000)]
];

function calculateTotalUsage($devices) {
    return array_reduce($devices, function($total, $device) {
        return $total + $device['usage'];
    }, 0);
}

function generateAIInsights($devices) {
    $insights = [];
    $totalUsage = calculateTotalUsage($devices);
    
    // Check for high-consumption devices
    foreach ($devices as $device) {
        if ($device['type'] === 'hvac' && $device['usage'] > 1200) {
            $insights[] = [
                'type' => 'warning',
                'device' => $device['name'],
                'message' => "Consider setting your {$device['name']} to 24°C for optimal efficiency"
            ];
        }
        
        if ($device['type'] === 'entertainment' && $device['usage'] > 100) {
            $insights[] = [
                'type' => 'info',
                'device' => $device['name'],
                'message' => "{$device['name']} consumption is higher than usual"
            ];
        }
    }
    
    // Overall usage insights
    if ($totalUsage > 3000) {
        $insights[] = [
            'type' => 'alert',
            'message' => 'Your current power consumption is unusually high'
        ];
    }
    
    // Time-based recommendations
    $hour = (int)date('H');
    if ($hour >= 17 && $hour <= 21) {
        $insights[] = [
            'type' => 'warning',
            'message' => 'You are in peak hours. Consider reducing non-essential device usage'
        ];
    }
    
    return $insights;
}

function getHistoricalData($timeframe = 'day') {
    $data = [];
    switch ($timeframe) {
        case 'day':
            for ($i = 0; $i < 24; $i++) {
                $data[] = [
                    'time' => sprintf('%02d:00', $i),
                    'usage' => rand(1500, 3500)
                ];
            }
            break;
        case 'week':
            $days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
            foreach ($days as $day) {
                $data[] = [
                    'time' => $day,
                    'usage' => rand(20000, 35000)
                ];
            }
            break;
        case 'month':
            for ($i = 1; $i <= 30; $i++) {
                $data[] = [
                    'time' => "Day $i",
                    'usage' => rand(20000, 40000)
                ];
            }
            break;
    }
    return $data;
}

switch ($request_path) {
    case '/api/power/current':
        $totalUsage = calculateTotalUsage($devices);
        $insights = generateAIInsights($devices);
        
        echo json_encode([
            'timestamp' => date('Y-m-d H:i:s'),
            'totalUsage' => $totalUsage,
            'devices' => $devices,
            'insights' => $insights
        ]);
        break;
        
    case '/api/power/history':
        $timeframe = $_GET['timeframe'] ?? 'day';
        echo json_encode([
            'timeframe' => $timeframe,
            'data' => getHistoricalData($timeframe)
        ]);
        break;
        
    case '/api/power/insights':
        echo json_encode([
            'insights' => generateAIInsights($devices)
        ]);
        break;
        
    default:
        http_response_code(404);
        echo json_encode(['error' => 'Endpoint not found']);
}
