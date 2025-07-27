<?php
class Database {
    private $host;
    private $db_name;
    private $username;
    private $password;
    private $charset;
    public $conn;

    public function __construct() {
        // Carregar variáveis de ambiente se não estiverem carregadas
        if (!isset($_ENV['DB_HOST'])) {
            $this->loadEnvFile();
        }
        
        $this->host = $_ENV['DB_HOST'] ?? 'localhost';
        $this->db_name = $_ENV['DB_NAME'] ?? '';
        $this->username = $_ENV['DB_USER'] ?? '';
        $this->password = $_ENV['DB_PASS'] ?? '';
        $this->charset = $_ENV['DB_CHARSET'] ?? 'utf8mb4';
        
        // Validar se as variáveis essenciais estão definidas
        if (empty($this->db_name) || empty($this->username)) {
            error_log("Database configuration missing: DB_NAME or DB_USER not set");
            throw new Exception("Database configuration incomplete");
        }
    }
    
    private function loadEnvFile() {
        $envFile = __DIR__ . '/../.env';
        if (file_exists($envFile)) {
            $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
            foreach ($lines as $line) {
                if (strpos(trim($line), '#') === 0) continue;
                if (strpos($line, '=') === false) continue;
                
                list($name, $value) = explode('=', $line, 2);
                $_ENV[trim($name)] = trim($value);
            }
        }
    }

    public function getConnection() {
        $this->conn = null;

        try {
            $dsn = "mysql:host=" . $this->host . ";dbname=" . $this->db_name . ";charset=" . $this->charset;
            $options = [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
                PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES " . $this->charset,
                PDO::ATTR_TIMEOUT => 30,
                PDO::MYSQL_ATTR_USE_BUFFERED_QUERY => true
            ];

            $this->conn = new PDO($dsn, $this->username, $this->password, $options);
            
            // Testar a conexão
            $this->conn->query("SELECT 1");
            
        } catch(PDOException $exception) {
            $errorMsg = "Database connection failed: " . $exception->getMessage();
            error_log($errorMsg);
            
            // Log detalhado para debug (apenas em desenvolvimento)
            if ($_ENV['DEBUG'] === 'true') {
                error_log("DB Config - Host: {$this->host}, DB: {$this->db_name}, User: {$this->username}");
            }
            
            throw new Exception("Database connection failed. Check your database configuration.");
        }

        return $this->conn;
    }
    
    // Método para testar conexão
    public function testConnection() {
        try {
            $conn = $this->getConnection();
            return ['success' => true, 'message' => 'Connection successful'];
        } catch (Exception $e) {
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }
}
?>