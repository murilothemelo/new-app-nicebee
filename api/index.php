<?php
// Error reporting para desenvolvimento - remover em produção
if (!isset($_ENV['ENVIRONMENT']) || $_ENV['ENVIRONMENT'] !== 'production') {
    error_reporting(E_ALL);
    ini_set('display_errors', 1);
} else {
    error_reporting(0);
    ini_set('display_errors', 0);
}

// Load environment variables
if (file_exists(__DIR__ . '/.env')) {
    $lines = file(__DIR__ . '/.env', FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos(trim($line), '#') === 0) continue;
        if (strpos($line, '=') === false) continue;
        
        list($name, $value) = explode('=', $line, 2);
        $_ENV[trim($name)] = trim($value);
    }
}

// Verificar se as variáveis essenciais estão definidas
$requiredEnvVars = ['DB_HOST', 'DB_NAME', 'DB_USER', 'JWT_SECRET'];
foreach ($requiredEnvVars as $var) {
    if (empty($_ENV[$var])) {
        error_log("Missing required environment variable: $var");
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Server configuration error',
            'missing_var' => $var
        ]);
        exit;
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
    error_log('API Error: ' . $e->getMessage() . ' in ' . $e->getFile() . ':' . $e->getLine());
    
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Erro interno do servidor',
        'debug' => $_ENV['DEBUG'] === 'true' ? $e->getMessage() : null
    ]);
}
?>