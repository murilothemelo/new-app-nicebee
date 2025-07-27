<?php
require_once __DIR__ . '/../config/jwt.php';
require_once __DIR__ . '/../utils/response.php';

function requireAuth() {
    $jwt = new JWTHandler();
    $token = $jwt->getTokenFromHeader();
    
    if (!$token) {
        Response::unauthorized('Token de acesso requerido');
    }
    
    $user_data = $jwt->validateToken($token);
    
    if (!$user_data) {
        Response::unauthorized('Token inválido ou expirado');
    }
    
    return $user_data;
}

function requireRole($allowed_roles = []) {
    $user = requireAuth();
    
    if (!empty($allowed_roles) && !in_array($user->tipo, $allowed_roles)) {
        Response::forbidden('Acesso negado para este tipo de usuário');
    }
    
    return $user;
}
?>