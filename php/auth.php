<?php
require_once 'config.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

function generateToken($user_id) {
    $payload = [
        'user_id' => $user_id,
        'exp' => time() + (24 * 60 * 60) // 24 hours expiration
    ];
    return base64_encode(json_encode($payload));
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $conn = getDBConnection();
    $data = json_decode(file_get_contents('php://input'), true);
    $action = isset($data['action']) ? sanitizeInput($conn, $data['action']) : '';

    switch ($action) {
        case 'login':
            if (!isset($data['username']) || !isset($data['password'])) {
                jsonResponse(false, null, 'Missing credentials');
            }

            $username = sanitizeInput($conn, $data['username']);
            $password = $data['password'];

            $query = "SELECT user_id, password_hash FROM users WHERE username = ?";
            $stmt = $conn->prepare($query);
            $stmt->bind_param("s", $username);
            $stmt->execute();
            $result = $stmt->get_result();

            if ($row = $result->fetch_assoc()) {
                if (password_verify($password, $row['password_hash'])) {
                    $token = generateToken($row['user_id']);
                    jsonResponse(true, ['token' => $token, 'user_id' => $row['user_id']]);
                }
            }
            jsonResponse(false, null, 'Invalid credentials');
            break;

        case 'register':
            if (!isset($data['username']) || !isset($data['password']) || !isset($data['email'])) {
                jsonResponse(false, null, 'Missing required fields');
            }

            $username = sanitizeInput($conn, $data['username']);
            $email = sanitizeInput($conn, $data['email']);
            $password_hash = password_hash($data['password'], PASSWORD_DEFAULT);

            // Check if username or email already exists
            $query = "SELECT user_id FROM users WHERE username = ? OR email = ?";
            $stmt = $conn->prepare($query);
            $stmt->bind_param("ss", $username, $email);
            $stmt->execute();
            if ($stmt->get_result()->num_rows > 0) {
                jsonResponse(false, null, 'Username or email already exists');
            }

            // Insert new user
            $query = "INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)";
            $stmt = $conn->prepare($query);
            $stmt->bind_param("sss", $username, $email, $password_hash);
            
            if ($stmt->execute()) {
                $user_id = $conn->insert_id;
                
                // Create default preferences
                $query = "INSERT INTO user_preferences (user_id) VALUES (?)";
                $stmt = $conn->prepare($query);
                $stmt->bind_param("i", $user_id);
                $stmt->execute();
                
                $token = generateToken($user_id);
                jsonResponse(true, ['token' => $token, 'user_id' => $user_id]);
            } else {
                jsonResponse(false, null, 'Registration failed');
            }
            break;

        default:
            jsonResponse(false, null, 'Invalid action');
    }
}

function sanitizeInput($conn, $input) {
    return $conn->real_escape_string($input);
}

function jsonResponse($success, $data, $message = '') {
    $response = [
        'success' => $success,
        'message' => $message
    ];

    if ($data !== null) {
        $response['data'] = $data;
    }

    http_response_code(200);
    echo json_encode($response);
    exit;
}
