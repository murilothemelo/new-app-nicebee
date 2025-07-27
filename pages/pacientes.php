<?php
$db = getDB();
$userType = $_SESSION['user_type'];
$userId = $_SESSION['user_id'];

// Filtros
$search = $_GET['search'] ?? '';
$categoria = $_GET['categoria'] ?? '';
$status = $_GET['status'] ?? '';
$page = max(1, $_GET['p'] ?? 1);

// Construir query
$where = ['1=1'];
$params = [];

if ($search) {
    $where[] = "(p.nome_completo LIKE ? OR p.email LIKE ?)";
    $params[] = "%$search%";
    $params[] = "%$search%";
}

if ($categoria) {
    $where[] = "p.categoria = ?";
    $params[] = $categoria;
}

if ($status) {
    $where[] = "p.status = ?";
    $params[] = $status;
}

// Se for profissional, só pode ver seus pacientes
if ($userType === 'profissional') {
    $where[] = "p.profissional_responsavel_id = ?";
    $params[] = $userId;
}

$whereClause = implode(' AND ', $where);

$query = "
    SELECT p.*, u.nome as profissional_nome, pm.nome as plano_nome
    FROM pacientes p
    LEFT JOIN usuarios u ON p.profissional_responsavel_id = u.id
    LEFT JOIN planos_medicos pm ON p.plano_medico_id = pm.id
    WHERE $whereClause
    ORDER BY p.created_at DESC
";

$result = paginate($query, $page, 20, $params);
$pacientes = $result['data'];
$pagination = $result['pagination'];

// Processar formulário
if ($_POST && $_POST['action'] === 'create' && in_array($userType, ['admin', 'assistente'])) {
    $nome = sanitize($_POST['nome_completo']);
    $dataNascimento = $_POST['data_nascimento'];
    $genero = $_POST['genero'];
    $categoria = $_POST['categoria'];
    $email = sanitize($_POST['email']);
    $telefone = sanitize($_POST['telefone']);
    $endereco = sanitize($_POST['endereco']);
    $profissionalId = $_POST['profissional_responsavel_id'] ?: null;
    $planoId = $_POST['plano_medico_id'] ?: null;
    
    if ($nome && $dataNascimento && $genero && $categoria) {
        $stmt = $db->prepare("
            INSERT INTO pacientes (nome_completo, data_nascimento, genero, categoria, email, telefone, endereco, profissional_responsavel_id, plano_medico_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        
        if ($stmt->execute([$nome, $dataNascimento, $genero, $categoria, $email, $telefone, $endereco, $profissionalId, $planoId])) {
            header('Location: ?page=pacientes&success=1');
            exit;
        }
    }
}

// Obter dados para formulário
$profissionais = $db->query("SELECT id, nome FROM usuarios WHERE tipo = 'profissional' AND status = 'ativo' ORDER BY nome")->fetchAll();
$planos = $db->query("SELECT id, nome FROM planos_medicos WHERE status = 'Ativo' ORDER BY nome")->fetchAll();
?>

<div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
            <h1 class="text-2xl font-bold text-gray-900">Pacientes</h1>
            <p class="text-gray-600">Gerencie os pacientes da clínica</p>
        </div>
        <?php if (in_array($userType, ['admin', 'assistente'])): ?>
            <button onclick="openModal('modalNovoPaciente')" class="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors">
                <i data-lucide="plus" class="w-5 h-5"></i>
                Novo Paciente
            </button>
        <?php endif; ?>
    </div>

    <!-- Filtros -->
    <div class="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <form method="GET" class="flex flex-col lg:flex-row gap-4">
            <input type="hidden" name="page" value="pacientes">
            
            <div class="relative flex-1">
                <i data-lucide="search" class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5"></i>
                <input type="text" name="search" value="<?= htmlspecialchars($search) ?>" 
                       placeholder="Buscar pacientes..." 
                       class="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full">
            </div>
            
            <select name="categoria" class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option value="">Todas as categorias</option>
                <option value="Infantil" <?= $categoria === 'Infantil' ? 'selected' : '' ?>>Infantil</option>
                <option value="Adolescente" <?= $categoria === 'Adolescente' ? 'selected' : '' ?>>Adolescente</option>
                <option value="Adulto" <?= $categoria === 'Adulto' ? 'selected' : '' ?>>Adulto</option>
                <option value="Idoso" <?= $categoria === 'Idoso' ? 'selected' : '' ?>>Idoso</option>
            </select>
            
            <select name="status" class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option value="">Todos os status</option>
                <option value="Ativo" <?= $status === 'Ativo' ? 'selected' : '' ?>>Ativo</option>
                <option value="Inativo" <?= $status === 'Inativo' ? 'selected' : '' ?>>Inativo</option>
                <option value="Em Avaliação" <?= $status === 'Em Avaliação' ? 'selected' : '' ?>>Em Avaliação</option>
            </select>
            
            <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Filtrar
            </button>
        </form>
    </div>

    <!-- Lista de Pacientes -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="overflow-x-auto">
            <table class="w-full">
                <thead class="bg-gray-50">
                    <tr>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paciente</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoria</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Profissional</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                    </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                    <?php foreach ($pacientes as $paciente): ?>
                        <tr class="hover:bg-gray-50">
                            <td class="px-6 py-4 whitespace-nowrap">
                                <div class="flex items-center">
                                    <div class="flex-shrink-0 h-10 w-10">
                                        <div class="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                                            <?= substr($paciente['nome_completo'], 0, 1) ?>
                                        </div>
                                    </div>
                                    <div class="ml-4">
                                        <div class="text-sm font-medium text-gray-900"><?= htmlspecialchars($paciente['nome_completo']) ?></div>
                                        <div class="text-sm text-gray-500"><?= htmlspecialchars($paciente['email']) ?></div>
                                        <div class="text-sm text-gray-500">
                                            <?= calculateAge($paciente['data_nascimento']) ?> anos - <?= $paciente['genero'] ?>
                                        </div>
                                    </div>
                                </div>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                <span class="inline-flex px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                                    <?= $paciente['categoria'] ?>
                                </span>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                <span class="inline-flex px-2 py-1 text-xs font-medium rounded-full <?= getStatusColor($paciente['status']) ?>">
                                    <?= $paciente['status'] ?>
                                </span>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                <?= htmlspecialchars($paciente['profissional_nome'] ?? 'Não atribuído') ?>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <div class="flex gap-2">
                                    <button onclick="viewPaciente(<?= $paciente['id'] ?>)" class="text-blue-600 hover:text-blue-900">
                                        <i data-lucide="eye" class="w-4 h-4"></i>
                                    </button>
                                    <?php if (in_array($userType, ['admin', 'assistente'])): ?>
                                        <button onclick="editPaciente(<?= $paciente['id'] ?>)" class="text-green-600 hover:text-green-900">
                                            <i data-lucide="edit" class="w-4 h-4"></i>
                                        </button>
                                    <?php endif; ?>
                                    <button onclick="viewProntuario(<?= $paciente['id'] ?>)" class="text-purple-600 hover:text-purple-900">
                                        <i data-lucide="file-text" class="w-4 h-4"></i>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
        </div>
    </div>

    <!-- Paginação -->
    <?php if ($pagination['total_pages'] > 1): ?>
        <div class="flex items-center justify-between">
            <div class="text-sm text-gray-700">
                Mostrando <?= (($pagination['current_page'] - 1) * $pagination['per_page']) + 1 ?> a 
                <?= min($pagination['current_page'] * $pagination['per_page'], $pagination['total']) ?> de 
                <?= $pagination['total'] ?> resultados
            </div>
            <div class="flex gap-2">
                <?php if ($pagination['has_prev']): ?>
                    <a href="?page=pacientes&p=<?= $pagination['current_page'] - 1 ?>&search=<?= urlencode($search) ?>&categoria=<?= urlencode($categoria) ?>&status=<?= urlencode($status) ?>" 
                       class="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50">Anterior</a>
                <?php endif; ?>
                
                <span class="px-3 py-1 bg-blue-600 text-white rounded"><?= $pagination['current_page'] ?></span>
                
                <?php if ($pagination['has_next']): ?>
                    <a href="?page=pacientes&p=<?= $pagination['current_page'] + 1 ?>&search=<?= urlencode($search) ?>&categoria=<?= urlencode($categoria) ?>&status=<?= urlencode($status) ?>" 
                       class="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50">Próximo</a>
                <?php endif; ?>
            </div>
        </div>
    <?php endif; ?>
</div>

<!-- Modal Novo Paciente -->
<?php if (in_array($userType, ['admin', 'assistente'])): ?>
<div id="modalNovoPaciente" class="fixed inset-0 bg-black bg-opacity-50 z-50 hidden">
    <div class="flex items-center justify-center min-h-screen p-4">
        <div class="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div class="p-6">
                <div class="flex justify-between items-center mb-6">
                    <h3 class="text-lg font-semibold text-gray-900">Novo Paciente</h3>
                    <button onclick="closeModal('modalNovoPaciente')" class="text-gray-400 hover:text-gray-600">
                        <i data-lucide="x" class="w-6 h-6"></i>
                    </button>
                </div>
                
                <form method="POST" class="space-y-4">
                    <input type="hidden" name="action" value="create">
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Nome Completo *</label>
                            <input type="text" name="nome_completo" required 
                                   class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Data de Nascimento *</label>
                            <input type="date" name="data_nascimento" required 
                                   class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Gênero *</label>
                            <select name="genero" required 
                                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                                <option value="">Selecionar</option>
                                <option value="Masculino">Masculino</option>
                                <option value="Feminino">Feminino</option>
                                <option value="Outro">Outro</option>
                                <option value="Não informado">Não informado</option>
                            </select>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Categoria *</label>
                            <select name="categoria" required 
                                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                                <option value="">Selecionar</option>
                                <option value="Infantil">Infantil</option>
                                <option value="Adolescente">Adolescente</option>
                                <option value="Adulto">Adulto</option>
                                <option value="Idoso">Idoso</option>
                            </select>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
                            <input type="email" name="email" 
                                   class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Telefone</label>
                            <input type="tel" name="telefone" 
                                   class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Profissional Responsável</label>
                            <select name="profissional_responsavel_id" 
                                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                                <option value="">Selecionar</option>
                                <?php foreach ($profissionais as $prof): ?>
                                    <option value="<?= $prof['id'] ?>"><?= htmlspecialchars($prof['nome']) ?></option>
                                <?php endforeach; ?>
                            </select>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Plano Médico</label>
                            <select name="plano_medico_id" 
                                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                                <option value="">Selecionar</option>
                                <?php foreach ($planos as $plano): ?>
                                    <option value="<?= $plano['id'] ?>"><?= htmlspecialchars($plano['nome']) ?></option>
                                <?php endforeach; ?>
                            </select>
                        </div>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Endereço</label>
                        <textarea name="endereco" rows="3" 
                                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"></textarea>
                    </div>
                    
                    <div class="flex justify-end gap-3 pt-4">
                        <button type="button" onclick="closeModal('modalNovoPaciente')" 
                                class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                            Cancelar
                        </button>
                        <button type="submit" 
                                class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                            Salvar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</div>
<?php endif; ?>

<script>
function openModal(modalId) {
    document.getElementById(modalId).classList.remove('hidden');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.add('hidden');
}

function viewPaciente(id) {
    // Implementar visualização do paciente
    alert('Visualizar paciente ID: ' + id);
}

function editPaciente(id) {
    // Implementar edição do paciente
    alert('Editar paciente ID: ' + id);
}

function viewProntuario(id) {
    window.location.href = '?page=prontuario&paciente_id=' + id;
}
</script>