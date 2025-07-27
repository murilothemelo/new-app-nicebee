<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../utils/response.php';
require_once __DIR__ . '/../utils/validation.php';
require_once __DIR__ . '/../middleware/auth.php';

class PacientesController {
    private $db;
    
    public function __construct() {
        $database = new Database();
        $this->db = $database->getConnection();
    }
    
    public function index() {
        try {
            $user = requireAuth();
            
            $page = $_GET['page'] ?? 1;
            $limit = $_GET['limit'] ?? 20;
            $categoria = $_GET['categoria'] ?? '';
            $status = $_GET['status'] ?? '';
            $profissional_id = $_GET['profissional_id'] ?? '';
            
            $offset = ($page - 1) * $limit;
            
            $where_conditions = ['1=1'];
            $params = [];
            
            if ($categoria) {
                $where_conditions[] = 'p.categoria = :categoria';
                $params[':categoria'] = $categoria;
            }
            
            if ($status) {
                $where_conditions[] = 'p.status = :status';
                $params[':status'] = $status;
            }
            
            if ($profissional_id) {
                $where_conditions[] = 'p.profissional_responsavel_id = :profissional_id';
                $params[':profissional_id'] = $profissional_id;
            }
            
            // Se for profissional, só pode ver seus próprios pacientes
            if ($user->tipo === 'profissional') {
                $where_conditions[] = 'p.profissional_responsavel_id = :user_id';
                $params[':user_id'] = $user->id;
            }
            
            $where_clause = implode(' AND ', $where_conditions);
            
            $query = "
                SELECT p.*, u.nome as profissional_nome, pm.nome as plano_nome
                FROM pacientes p
                LEFT JOIN usuarios u ON p.profissional_responsavel_id = u.id
                LEFT JOIN planos_medicos pm ON p.plano_medico_id = pm.id
                WHERE $where_clause
                ORDER BY p.created_at DESC
                LIMIT :limit OFFSET :offset
            ";
            
            $stmt = $this->db->prepare($query);
            foreach ($params as $key => $value) {
                $stmt->bindValue($key, $value);
            }
            $stmt->bindValue(':limit', (int)$limit, PDO::PARAM_INT);
            $stmt->bindValue(':offset', (int)$offset, PDO::PARAM_INT);
            $stmt->execute();
            
            $pacientes = $stmt->fetchAll();
            
            // Contar total
            $count_query = "SELECT COUNT(*) as total FROM pacientes p WHERE $where_clause";
            $count_stmt = $this->db->prepare($count_query);
            foreach ($params as $key => $value) {
                $count_stmt->bindValue($key, $value);
            }
            $count_stmt->execute();
            $total = $count_stmt->fetch()['total'];
            
            Response::success([
                'data' => $pacientes,
                'pagination' => [
                    'page' => (int)$page,
                    'limit' => (int)$limit,
                    'total' => (int)$total,
                    'pages' => ceil($total / $limit)
                ]
            ]);
            
        } catch (Exception $e) {
            error_log('Pacientes index error: ' . $e->getMessage());
            Response::serverError();
        }
    }
    
    public function show($id) {
        try {
            $user = requireAuth();
            
            $where_clause = 'p.id = :id';
            $params = [':id' => $id];
            
            // Se for profissional, só pode ver seus próprios pacientes
            if ($user->tipo === 'profissional') {
                $where_clause .= ' AND p.profissional_responsavel_id = :user_id';
                $params[':user_id'] = $user->id;
            }
            
            $query = "
                SELECT p.*, u.nome as profissional_nome, pm.nome as plano_nome
                FROM pacientes p
                LEFT JOIN usuarios u ON p.profissional_responsavel_id = u.id
                LEFT JOIN planos_medicos pm ON p.plano_medico_id = pm.id
                WHERE $where_clause
            ";
            
            $stmt = $this->db->prepare($query);
            foreach ($params as $key => $value) {
                $stmt->bindValue($key, $value);
            }
            $stmt->execute();
            
            $paciente = $stmt->fetch();
            
            if (!$paciente) {
                Response::notFound('Paciente não encontrado');
            }
            
            Response::success($paciente);
            
        } catch (Exception $e) {
            error_log('Paciente show error: ' . $e->getMessage());
            Response::serverError();
        }
    }
    
    public function store() {
        try {
            $user = requireRole(['admin', 'assistente']);
            
            $input = json_decode(file_get_contents('php://input'), true);
            
            $nome_completo = Validator::sanitize($input['nome_completo'] ?? '');
            $data_nascimento = $input['data_nascimento'] ?? '';
            $genero = $input['genero'] ?? '';
            $categoria = $input['categoria'] ?? '';
            $email = Validator::sanitize($input['email'] ?? '');
            $telefone = Validator::sanitize($input['telefone'] ?? '');
            $endereco = Validator::sanitize($input['endereco'] ?? '');
            $profissional_responsavel_id = $input['profissional_responsavel_id'] ?? null;
            $plano_medico_id = $input['plano_medico_id'] ?? null;
            
            // Validações
            if (!Validator::required($nome_completo) || !$data_nascimento || !$genero || !$categoria) {
                Response::error('Campos obrigatórios não preenchidos');
            }
            
            if ($email && !Validator::email($email)) {
                Response::error('Email inválido');
            }
            
            $query = "
                INSERT INTO pacientes (
                    nome_completo, data_nascimento, genero, categoria, email, telefone,
                    endereco, profissional_responsavel_id, plano_medico_id
                ) VALUES (
                    :nome_completo, :data_nascimento, :genero, :categoria, :email, :telefone,
                    :endereco, :profissional_responsavel_id, :plano_medico_id
                )
            ";
            
            $stmt = $this->db->prepare($query);
            $stmt->bindParam(':nome_completo', $nome_completo);
            $stmt->bindParam(':data_nascimento', $data_nascimento);
            $stmt->bindParam(':genero', $genero);
            $stmt->bindParam(':categoria', $categoria);
            $stmt->bindParam(':email', $email);
            $stmt->bindParam(':telefone', $telefone);
            $stmt->bindParam(':endereco', $endereco);
            $stmt->bindParam(':profissional_responsavel_id', $profissional_responsavel_id);
            $stmt->bindParam(':plano_medico_id', $plano_medico_id);
            
            if ($stmt->execute()) {
                $paciente_id = $this->db->lastInsertId();
                
                // Buscar o paciente criado
                $select_query = "SELECT * FROM pacientes WHERE id = :id";
                $select_stmt = $this->db->prepare($select_query);
                $select_stmt->bindParam(':id', $paciente_id);
                $select_stmt->execute();
                
                $paciente = $select_stmt->fetch();
                
                Response::success($paciente, 'Paciente criado com sucesso');
            } else {
                Response::serverError('Erro ao criar paciente');
            }
            
        } catch (Exception $e) {
            error_log('Paciente store error: ' . $e->getMessage());
            Response::serverError();
        }
    }
}
?>