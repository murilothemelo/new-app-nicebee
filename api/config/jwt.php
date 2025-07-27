<?php
require_once __DIR__ . '/../vendor/autoload.php';
use Firebase\JWT\JWT;
use Firebase\JWT\Key;

class JWTHandler {
    private $secret_key;
    private $expire_time;

    public function __construct() {
        $this->secret_key = $_ENV['JWT_SECRET'] ?? 'default_secret_key';
        $this->expire_time = $_ENV['JWT_EXPIRE'] ?? 86400; // 24 hours
    }

    public function generateToken($user_data) {
        $issued_at = time();
        $expiration_time = $issued_at + $this->expire_time;
        
        $payload = array(
            "iss" => "https://api.nicebee.com.br",
            "aud" => "https://app.nicebee.com.br",
            "iat" => $issued_at,
            "exp" => $expiration_time,
            "data" => $user_data
        );

        return JWT::encode($payload, $this->secret_key, 'HS256');
    }

    public function validateToken($token) {
        try {
            $decoded = JWT::decode($token, new Key($this->secret_key, 'HS256'));
            return $decoded->data;
        } catch (Exception $e) {
            return false;
        }
    }

    public function getTokenFromHeader() {
        $headers = getallheaders();
        $authorization = $headers['Authorization'] ?? $headers['authorization'] ?? '';
        
        if (preg_match('/Bearer\s(\S+)/', $authorization, $matches)) {
            return $matches[1];
        }
        
        return null;
    }
}
?>