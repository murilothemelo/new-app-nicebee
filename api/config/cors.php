<?php
function handleCors() {
    $allowed_origins = [
        'https://app.nicebee.com.br',
        'https://www.app.nicebee.com.br',
        'http://localhost:5173', // Para desenvolvimento local
        'http://localhost:3000',  // Para desenvolvimento local
        'http://127.0.0.1:5173',
        'http://127.0.0.1:3000'
    ];
    
    $origin = $_SERVER['HTTP_ORIGIN'] ?? $_SERVER['HTTP_REFERER'] ?? '';
    
    // Remove trailing slash and protocol variations
    $origin = rtrim($origin, '/');
    
    if (in_array($origin, $allowed_origins)) {
        header("Access-Control-Allow-Origin: $origin");
    } else {
        // Para produção, permitir apenas o domínio principal se não houver origin específico
        if (empty($origin) && $_ENV['ENVIRONMENT'] === 'production') {
            header("Access-Control-Allow-Origin: https://app.nicebee.com.br");
        }
    }
    
    header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
    header("Access-Control-Allow-Credentials: true");
    header("Access-Control-Max-Age: 86400");
    
    // Handle preflight requests
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(200);
        exit();
    }
}
?>