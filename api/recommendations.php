<?php
require_once 'config.php';

// Set headers for CORS and JSON response
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');

// Get energy-saving recommendations
function getRecommendations($conn) {
    try {
        // Example logic for recommendations based on power usage
        $query = "SELECT * FROM recommendations WHERE active = 1";
        $result = $conn->query($query);

        if (!$result) {
            throw new Exception($conn->error);
        }

        $recommendations = [];
        while ($row = $result->fetch_assoc()) {
            $recommendations[] = $row;
        }

        jsonResponse([
            'success' => true,
            'data' => $recommendations
        ]);

    } catch (Exception $e) {
        return handleDBError($conn, $e->getMessage());
    }
}

// Call the function to get recommendations
getRecommendations($conn);
