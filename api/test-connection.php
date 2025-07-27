<?php
// Arquivo para testar conexão com banco de dados
// Acesse: https://api.nicebee.com.br/test-connection.php

// Carregar variáveis de ambiente
if (file_exists(__DIR__ . '/.env')) {
    $lines = file(__DIR__ . '/.env', FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos(trim($line), '#') === 0) continue;
        if (strpos($line, '=') === false) continue;
        
        list($name, $value) = explode('=', $line, 2);
        $_ENV[trim($name)] = trim($value);
    }
}

header('Content-Type: application/json');

// Verificar se é ambiente de produção
if ($_ENV['ENVIRONMENT'] === 'production' && $_ENV['DEBUG'] !== 'true') {
    http_response_code(404);
    echo json_encode(['error' => 'Not found']);
    exit;
}

try {
    require_once __DIR__ . '/config/database.php';
    
    $database = new Database();
    $result = $database->testConnection();
    
    if ($result['success']) {
        // Testar algumas queries básicas
        $conn = $database->getConnection();
        
        // Verificar se as tabelas existem
        $tables = ['usuarios', 'pacientes', 'tipos_terapia'];
        $existingTables = [];
        
        foreach ($tables as $table) {
            $stmt = $conn->prepare("SHOW TABLES LIKE ?");
            $stmt->execute([$table]);
            if ($stmt->rowCount() > 0) {
                $existingTables[] = $table;
            }
        }
        
        echo json_encode([
            'success' => true,
            'message' => 'Database connection successful',
            'database' => $_ENV['DB_NAME'],
            'host' => $_ENV['DB_HOST'],
            'existing_tables' => $existingTables,
            'total_tables' => count($existingTables)
        ]);
    } else {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => $result['message'],
            'config_check' => [
                'env_file_exists' => file_exists(__DIR__ . '/.env'),
                'db_host' => $_ENV['DB_HOST'] ?? 'NOT SET',
                'db_name' => $_ENV['DB_NAME'] ?? 'NOT SET',
                'db_user' => $_ENV['DB_USER'] ?? 'NOT SET',
                'db_pass' => !empty($_ENV['DB_PASS']) ? 'SET' : 'NOT SET'
            ]
        ]);
    }
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage(),
        'file' => $e->getFile(),
        'line' => $e->getLine()
    ]);
}
?>