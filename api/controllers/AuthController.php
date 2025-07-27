<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/jwt.php';
require_once __DIR__ . '/../utils/response.php';
require_once __DIR__ . '/../utils/validation.php';

class AuthController {
    private $db;
    private $jwt;
    
    public function __construct() {
        try {
            $database = new Database();
            $this->db = $database->getConnection();
            $this->jwt = new JWTHandler();
        } catch (Exception $e) {
            error_log('AuthController constructor error: ' . $e->getMessage());
            Response::serverError('Erro de conexão com banco de dados');
        }
    }
    
    public function login() {
        try {
            $input = json_decode(file_get_contents('php://input'), true);
            
            if (!$input) {
                Response::error('Dados inválidos');
            }
            
            $email = Validator::sanitize($input['email'] ?? '');
            $password = $input['password'] ?? '';
            
            if (!Validator::required($email) || !Validator::required($password)) {
                Response::error('Email e senha são obrigatórios');
            }
            
            if (!Validator::email($email)) {
                Response::error('Email inválido');
            }
            
            // Verificar conexão com banco
            if (!$this->db) {
                error_log('Database connection is null in AuthController::login');
                Response::serverError('Erro de conexão com banco de dados');
            }
            
            $query = "SELECT * FROM usuarios WHERE email = :email AND status = 'ativo'";
            $stmt = $this->db->prepare($query);
            $stmt->bindParam(':email', $email);
            $stmt->execute();
            
            $user = $stmt->fetch();
            
            if (!$user || !password_verify($password, $user['password'])) {
                Response::error('Credenciais inválidas', 401);
            }
            
            // Atualizar último login
            $update_query = "UPDATE usuarios SET ultimo_login = NOW() WHERE id = :id";
            $update_stmt = $this->db->prepare($update_query);
            $update_stmt->bindParam(':id', $user['id']);
            $update_stmt->execute();
            
            // Gerar token
            $token_data = [
                'id' => $user['id'],
                'email' => $user['email'],
                'tipo' => $user['tipo'],
                'especialidade_id' => $user['especialidade_id']
            ];
            
            $token = $this->jwt->generateToken($token_data);
            
            // Remover senha da resposta
            unset($user['password']);
            
            Response::success([
                'token' => $token,
                'user' => $user
            ], 'Login realizado com sucesso');
            
        } catch (Exception $e) {
            error_log('Login error: ' . $e->getMessage() . ' in ' . $e->getFile() . ':' . $e->getLine());
            Response::serverError('Erro interno do servidor');
        }
    }
    
    public function logout() {
        // Em uma implementação mais robusta, você poderia invalidar o token
        Response::success(null, 'Logout realizado com sucesso');
    }
    
    public function getCurrentUser() {
        try {
            $user_data = requireAuth();
            
            $query = "SELECT id, nome, email, tipo, especialidade_id, telefone, status FROM usuarios WHERE id = :id";
            $stmt = $this->db->prepare($query);
            $stmt->bindParam(':id', $user_data->id);
            $stmt->execute();
            
            $user = $stmt->fetch();
            
            if (!$user) {
                Response::notFound('Usuário não encontrado');
            }
            
            Response::success($user);
            
        } catch (Exception $e) {
            error_log('Get user error: ' . $e->getMessage());
            Response::serverError('Erro interno do servidor');
        }
    }
}
?>