<?php
require_once 'config/database.php';

// Função de autenticação
function authenticateUser($email, $password) {
    $db = getDB();
    $stmt = $db->prepare("SELECT * FROM usuarios WHERE email = ? AND status = 'ativo'");
    $stmt->execute([$email]);
    $user = $stmt->fetch();
    
    if ($user && password_verify($password, $user['password'])) {
        return $user;
    }
    return false;
}

// Atualizar último login
function updateLastLogin($userId) {
    $db = getDB();
    $stmt = $db->prepare("UPDATE usuarios SET ultimo_login = NOW() WHERE id = ?");
    $stmt->execute([$userId]);
}

// Obter usuário por ID
function getUserById($id) {
    $db = getDB();
    $stmt = $db->prepare("SELECT * FROM usuarios WHERE id = ?");
    $stmt->execute([$id]);
    return $stmt->fetch();
}

// Verificar permissões
function hasPermission($userType, $page) {
    $permissions = [
        'admin' => ['dashboard', 'pacientes', 'prontuario', 'agenda', 'evolucoes', 'relatorios', 'comunidade', 'planos', 'tipos-terapia', 'acompanhantes', 'usuarios', 'perfil'],
        'assistente' => ['dashboard', 'pacientes', 'prontuario', 'agenda', 'evolucoes', 'relatorios', 'comunidade', 'acompanhantes', 'perfil'],
        'profissional' => ['dashboard', 'pacientes', 'prontuario', 'agenda', 'evolucoes', 'relatorios', 'comunidade', 'acompanhantes', 'perfil']
    ];
    
    return in_array($page, $permissions[$userType] ?? []);
}

// Função para sanitizar dados
function sanitize($data) {
    return htmlspecialchars(trim($data), ENT_QUOTES, 'UTF-8');
}

// Função para formatar data
function formatDate($date, $format = 'd/m/Y') {
    return date($format, strtotime($date));
}

// Função para formatar data e hora
function formatDateTime($datetime, $format = 'd/m/Y H:i') {
    return date($format, strtotime($datetime));
}

// Função para calcular idade
function calculateAge($birthDate) {
    $birth = new DateTime($birthDate);
    $today = new DateTime();
    return $birth->diff($today)->y;
}

// Função para obter cor do status
function getStatusColor($status) {
    $colors = [
        'Ativo' => 'bg-green-100 text-green-800',
        'Inativo' => 'bg-red-100 text-red-800',
        'Em Avaliação' => 'bg-yellow-100 text-yellow-800',
        'Agendado' => 'bg-blue-100 text-blue-800',
        'Confirmado' => 'bg-green-100 text-green-800',
        'Cancelado' => 'bg-red-100 text-red-800',
        'Concluído' => 'bg-gray-100 text-gray-800',
        'Rascunho' => 'bg-yellow-100 text-yellow-800',
        'Finalizado' => 'bg-green-100 text-green-800',
        'Enviado' => 'bg-blue-100 text-blue-800'
    ];
    
    return $colors[$status] ?? 'bg-gray-100 text-gray-800';
}

// Função para upload de arquivos
function uploadFile($file, $allowedTypes = ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png'], $maxSize = 10485760) {
    if ($file['error'] !== UPLOAD_ERR_OK) {
        return ['success' => false, 'message' => 'Erro no upload do arquivo'];
    }
    
    $fileSize = $file['size'];
    if ($fileSize > $maxSize) {
        return ['success' => false, 'message' => 'Arquivo muito grande'];
    }
    
    $fileName = $file['name'];
    $fileExt = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));
    
    if (!in_array($fileExt, $allowedTypes)) {
        return ['success' => false, 'message' => 'Tipo de arquivo não permitido'];
    }
    
    $newFileName = uniqid() . '.' . $fileExt;
    $uploadPath = 'uploads/' . $newFileName;
    
    if (move_uploaded_file($file['tmp_name'], $uploadPath)) {
        return [
            'success' => true,
            'filename' => $newFileName,
            'path' => $uploadPath,
            'size' => $fileSize,
            'type' => $file['type']
        ];
    }
    
    return ['success' => false, 'message' => 'Erro ao salvar arquivo'];
}

// Função para paginação
function paginate($query, $page = 1, $perPage = 20, $params = []) {
    $db = getDB();
    
    // Contar total de registros
    $countQuery = "SELECT COUNT(*) as total FROM (" . $query . ") as count_table";
    $stmt = $db->prepare($countQuery);
    $stmt->execute($params);
    $total = $stmt->fetch()['total'];
    
    // Calcular offset
    $offset = ($page - 1) * $perPage;
    
    // Executar query com limit
    $limitQuery = $query . " LIMIT $perPage OFFSET $offset";
    $stmt = $db->prepare($limitQuery);
    $stmt->execute($params);
    $data = $stmt->fetchAll();
    
    return [
        'data' => $data,
        'pagination' => [
            'current_page' => $page,
            'per_page' => $perPage,
            'total' => $total,
            'total_pages' => ceil($total / $perPage),
            'has_prev' => $page > 1,
            'has_next' => $page < ceil($total / $perPage)
        ]
    ];
}
?>