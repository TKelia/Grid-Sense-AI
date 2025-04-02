<?php
require_once 'config.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit();
}

// Get request body
$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['action'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Action is required']);
    exit();
}

switch ($data['action']) {
    case 'signup':
        handleSignup($data);
        break;
    case 'login':
        handleLogin($data);
        break;
    default:
        http_response_code(400);
        echo json_encode(['error' => 'Invalid action']);
}

function handleSignup($data) {
    if (!isset($data['email']) || !isset($data['password'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Email and password are required']);
        return;
    }

    $email = filter_var($data['email'], FILTER_VALIDATE_EMAIL);
    if (!$email) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid email format']);
        return;
    }

    // For demo purposes, just return success
    // In production, you would:
    // 1. Hash the password using password_hash()
    // 2. Check if user exists in database
    // 3. Store in database using prepared statements
    // 4. Send verification email
    http_response_code(200);
    echo json_encode([
        'message' => 'Account created successfully',
        'user' => ['email' => $email]
    ]);
}

function handleLogin($data) {
    if (!isset($data['email']) || !isset($data['password'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Email and password are required']);
        return;
    }

    $email = filter_var($data['email'], FILTER_VALIDATE_EMAIL);
    if (!$email) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid email format']);
        return;
    }

    // For demo purposes, accept any valid email/password
    // In production, you would:
    // 1. Verify credentials against database using password_verify()
    // 2. Create a proper session with session_start()
    // 3. Set secure session cookie with proper flags
    // 4. Use HTTPS only
    // 5. Implement rate limiting
    // 6. Log authentication attempts
    
    session_start();
    $_SESSION['user_email'] = $email;
    
    http_response_code(200);
    echo json_encode([
        'token' => 'demo-token-' . bin2hex(random_bytes(16)),
        'user' => ['email' => $email]
    ]);
}
