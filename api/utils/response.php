<?php
class Response {
    public static function json($data, $status_code = 200) {
        http_response_code($status_code);
        header('Content-Type: application/json');
        echo json_encode($data, JSON_UNESCAPED_UNICODE);
        exit();
    }
    
    public static function success($data = null, $message = 'Success') {
        self::json([
            'success' => true,
            'message' => $message,
            'data' => $data
        ]);
    }
    
    public static function error($message = 'Error', $status_code = 400, $errors = null) {
        self::json([
            'success' => false,
            'message' => $message,
            'errors' => $errors
        ], $status_code);
    }
    
    public static function notFound($message = 'Recurso não encontrado') {
        self::error($message, 404);
    }
    
    public static function unauthorized($message = 'Não autorizado') {
        self::error($message, 401);
    }
    
    public static function forbidden($message = 'Acesso negado') {
        self::error($message, 403);
    }
    
    public static function serverError($message = 'Erro interno do servidor') {
        self::error($message, 500);
    }
}
?>