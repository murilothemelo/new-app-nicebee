<?php
require_once __DIR__ . '/../config/jwt.php';

function requireAuth() {
    $jwt = new JWTHandler();
    $token = $jwt->getTokenFromHeader();
    
    if (!$token) {
        http_response_code(401);
        echo json_encode(['message' => 'Token de acesso requerido']);
        exit();
    }
    
    $user_data = $jwt->validateToken($token);
    
    if (!$user_data) {
        http_response_code(403);
        echo json_encode(['message' => 'Token inválido']);
        exit();
    }
    
    return $user_data;
}

function requireRole($allowed_roles = []) {
    $user = requireAuth();
    
    if (!empty($allowed_roles) && !in_array($user->tipo, $allowed_roles)) {
        http_response_code(403);
        echo json_encode(['message' => 'Acesso negado']);
        exit();
    }
    
    return $user;
}
?>