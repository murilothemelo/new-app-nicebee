<?php
// Error reporting para desenvolvimento - remover em produção
if ($_ENV['ENVIRONMENT'] !== 'production') {
    error_reporting(E_ALL);
    ini_set('display_errors', 1);
}

// Load environment variables
if (file_exists(__DIR__ . '/.env')) {
    $lines = file(__DIR__ . '/.env', FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos(trim($line), '#') === 0) continue;
        list($name, $value) = explode('=', $line, 2);
        $_ENV[trim($name)] = trim($value);
    }
}

// Set timezone
date_default_timezone_set('America/Sao_Paulo');

// CORS handling
require_once __DIR__ . '/config/cors.php';
handleCors();

// Security headers
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header('X-XSS-Protection: 1; mode=block');
header('Referrer-Policy: strict-origin-when-cross-origin');

// Content type
header('Content-Type: application/json; charset=utf-8');

try {
    // Load routes
    $router = require_once __DIR__ . '/routes/routes.php';
    
    // Handle the request
    $router->handleRequest();
    
} catch (Exception $e) {
    error_log('API Error: ' . $e->getMessage());
    
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Erro interno do servidor'
    ]);
}
?>