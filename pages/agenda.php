<?php
$db = getDB();
$userType = $_SESSION['user_type'];
$userId = $_SESSION['user_id'];

// Data atual ou selecionada
$currentDate = $_GET['date'] ?? date('Y-m-d');
$viewMode = $_GET['view'] ?? 'week';

// Calcular início da semana
$startOfWeek = date('Y-m-d', strtotime('monday this week', strtotime($currentDate)));
$endOfWeek = date('Y-m-d', strtotime('sunday this week', strtotime($currentDate)));

// Obter agendamentos da semana
$where = "a.data_hora_inicio BETWEEN ? AND ?";
$params = [$startOfWeek . ' 00:00:00', $endOfWeek . ' 23:59:59'];

if ($userType === 'profissional') {
    $where .= " AND a.profissional_id = ?";
    $params[] = $userId;
}

$stmt = $db->prepare("
    SELECT a.*, p.nome_completo as paciente_nome, u.nome as profissional_nome, tt.nome as terapia_nome
    FROM agendamentos a
    JOIN pacientes p ON a.paciente_id = p.id
    JOIN usuarios u ON a.profissional_id = u.id
    JOIN tipos_terapia tt ON a.tipo_terapia_id = tt.id
    WHERE $where
    ORDER BY a.data_hora_inicio
");
$stmt->execute($params);
$agendamentos = $stmt->fetchAll();

// Processar formulário de novo agendamento
if ($_POST && $_POST['action'] === 'create' && in_array($userType, ['admin', 'assistente'])) {
    $pacienteId = $_POST['paciente_id'];
    $profissionalId = $_POST['profissional_id'];
    $tipoTerapiaId = $_POST['tipo_terapia_id'];
    $dataHoraInicio = $_POST['data_hora_inicio'];
    $duracao = $_POST['duracao'] ?? 60;
    $dataHoraFim = date('Y-m-d H:i:s', strtotime($dataHoraInicio . " +$duracao minutes"));
    $frequencia = $_POST['frequencia'] ?? 'Única';
    $observacoes = sanitize($_POST['observacoes']);
    
    if ($pacienteId && $profissionalId && $tipoTerapiaId && $dataHoraInicio) {
        // Verificar conflitos
        $stmt = $db->prepare("
            SELECT COUNT(*) as conflitos 
            FROM agendamentos 
            WHERE profissional_id = ? 
            AND status NOT IN ('Cancelado') 
            AND (
                (data_hora_inicio <= ? AND data_hora_fim > ?) OR
                (data_hora_inicio < ? AND data_hora_fim >= ?)
            )
        ");
        $stmt->execute([$profissionalId, $dataHoraInicio, $dataHoraInicio, $dataHoraFim, $dataHoraFim]);
        $conflitos = $stmt->fetch()['conflitos'];
        
        if ($conflitos == 0) {
            $stmt = $db->prepare("
                INSERT INTO agendamentos (paciente_id, profissional_id, tipo_terapia_id, data_hora_inicio, data_hora_fim, frequencia, observacoes)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ");
            
            if ($stmt->execute([$pacienteId, $profissionalId, $tipoTerapiaId, $dataHoraInicio, $dataHoraFim, $frequencia, $observacoes])) {
                header('Location: ?page=agenda&success=1');
                exit;
            }
        } else {
            $error = "Conflito de horário detectado!";
        }
    }
}

// Dados para formulário
$pacientes = $db->query("SELECT id, nome_completo FROM pacientes WHERE status = 'Ativo' ORDER BY nome_completo")->fetchAll();
$profissionais = $db->query("SELECT id, nome FROM usuarios WHERE tipo = 'profissional' AND status = 'ativo' ORDER BY nome")->fetchAll();
$tiposTerapia = $db->query("SELECT id, nome FROM tipos_terapia ORDER BY nome")->fetchAll();

// Organizar agendamentos por dia e hora
$agendamentosPorDia = [];
foreach ($agendamentos as $agendamento) {
    $dia = date('Y-m-d', strtotime($agendamento['data_hora_inicio']));
    $hora = date('H:i', strtotime($agendamento['data_hora_inicio']));
    $agendamentosPorDia[$dia][$hora][] = $agendamento;
}

// Gerar dias da semana
$diasSemana = [];
for ($i = 0; $i < 7; $i++) {
    $data = date('Y-m-d', strtotime($startOfWeek . " +$i days"));
    $diasSemana[] = [
        'data' => $data,
        'nome' => date('D', strtotime($data)),
        'numero' => date('j', strtotime($data)),
        'hoje' => $data === date('Y-m-d')
    ];
}

// Horários de funcionamento
$horarios = [];
for ($h = 8; $h <= 18; $h++) {
    $horarios[] = sprintf('%02d:00', $h);
}
?>

<div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
            <h1 class="text-2xl font-bold text-gray-900">Agenda</h1>
            <p class="text-gray-600">Gerencie os agendamentos da clínica</p>
        </div>
        <?php if (in_array($userType, ['admin', 'assistente'])): ?>
            <button onclick="openModal('modalNovoAgendamento')" class="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors">
                <i data-lucide="plus" class="w-5 h-5"></i>
                Novo Agendamento
            </button>
        <?php endif; ?>
    </div>

    <!-- Controles -->
    <div class="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div class="flex items-center gap-4">
                <a href="?page=agenda&date=<?= date('Y-m-d', strtotime($currentDate . ' -7 days')) ?>" 
                   class="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50">← Anterior</a>
                
                <h3 class="text-lg font-semibold text-gray-900">
                    <?= formatDate($startOfWeek, 'd/m') ?> - <?= formatDate($endOfWeek, 'd/m/Y') ?>
                </h3>
                
                <a href="?page=agenda&date=<?= date('Y-m-d', strtotime($currentDate . ' +7 days')) ?>" 
                   class="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50">Próximo →</a>
            </div>
            
            <div class="flex gap-2">
                <a href="?page=agenda&view=week&date=<?= $currentDate ?>" 
                   class="px-4 py-2 rounded-lg <?= $viewMode === 'week' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700' ?>">
                    Semana
                </a>
                <a href="?page=agenda&view=day&date=<?= $currentDate ?>" 
                   class="px-4 py-2 rounded-lg <?= $viewMode === 'day' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700' ?>">
                    Dia
                </a>
            </div>
        </div>
    </div>

    <!-- Visualização da Agenda -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="grid grid-cols-8 gap-0">
            <!-- Header com dias da semana -->
            <div class="p-4 border-b border-r border-gray-200 bg-gray-50">
                <div class="text-xs font-medium text-gray-500 uppercase">Horário</div>
            </div>
            
            <?php foreach ($diasSemana as $dia): ?>
                <div class="p-4 border-b border-r border-gray-200 bg-gray-50">
                    <div class="text-center">
                        <div class="text-xs font-medium text-gray-500 uppercase"><?= $dia['nome'] ?></div>
                        <div class="text-lg font-semibold mt-1 <?= $dia['hoje'] ? 'text-blue-600' : 'text-gray-900' ?>">
                            <?= $dia['numero'] ?>
                        </div>
                    </div>
                </div>
            <?php endforeach; ?>

            <!-- Slots de horário -->
            <?php foreach ($horarios as $horario): ?>
                <div class="p-2 border-b border-r border-gray-200 min-h-[80px] bg-gray-50 flex items-center justify-center">
                    <span class="text-xs text-gray-500"><?= $horario ?></span>
                </div>
                
                <?php foreach ($diasSemana as $dia): ?>
                    <div class="p-2 border-b border-r border-gray-200 min-h-[80px] relative">
                        <?php 
                        $agendamentosDoDia = $agendamentosPorDia[$dia['data']][$horario] ?? [];
                        foreach ($agendamentosDoDia as $agendamento): 
                            $statusColor = getStatusColor($agendamento['status']);
                        ?>
                            <div class="p-2 rounded text-xs border <?= $statusColor ?> mb-1 cursor-pointer hover:shadow-sm"
                                 onclick="viewAgendamento(<?= $agendamento['id'] ?>)">
                                <div class="font-medium truncate"><?= htmlspecialchars($agendamento['paciente_nome']) ?></div>
                                <div class="truncate"><?= htmlspecialchars($agendamento['terapia_nome']) ?></div>
                                <?php if ($userType !== 'profissional'): ?>
                                    <div class="flex items-center gap-1 mt-1">
                                        <i data-lucide="user" class="w-3 h-3"></i>
                                        <span class="truncate"><?= htmlspecialchars($agendamento['profissional_nome']) ?></span>
                                    </div>
                                <?php endif; ?>
                            </div>
                        <?php endforeach; ?>
                    </div>
                <?php endforeach; ?>
            <?php endforeach; ?>
        </div>
    </div>

    <!-- Lista de Agendamentos do Dia -->
    <div class="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Agendamentos de Hoje</h3>
        <div class="space-y-3">
            <?php 
            $agendamentosHoje = array_filter($agendamentos, function($a) {
                return date('Y-m-d', strtotime($a['data_hora_inicio'])) === date('Y-m-d');
            });
            
            foreach (array_slice($agendamentosHoje, 0, 5) as $agendamento): 
            ?>
                <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div class="flex items-center gap-4">
                        <div class="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                            <?= substr($agendamento['paciente_nome'], 0, 1) ?>
                        </div>
                        <div>
                            <p class="font-medium text-gray-900"><?= htmlspecialchars($agendamento['paciente_nome']) ?></p>
                            <p class="text-sm text-gray-600"><?= htmlspecialchars($agendamento['terapia_nome']) ?></p>
                            <div class="flex items-center gap-2 mt-1">
                                <i data-lucide="calendar" class="w-4 h-4 text-gray-400"></i>
                                <span class="text-xs text-gray-500">
                                    <?= formatDateTime($agendamento['data_hora_inicio'], 'H:i') ?>
                                </span>
                                <?php if ($userType !== 'profissional'): ?>
                                    <i data-lucide="user" class="w-4 h-4 text-gray-400 ml-2"></i>
                                    <span class="text-xs text-gray-500"><?= htmlspecialchars($agendamento['profissional_nome']) ?></span>
                                <?php endif; ?>
                            </div>
                        </div>
                    </div>
                    <div class="flex items-center gap-2">
                        <span class="px-2 py-1 text-xs rounded-full <?= getStatusColor($agendamento['status']) ?>">
                            <?= $agendamento['status'] ?>
                        </span>
                        <?php if (in_array($userType, ['admin', 'assistente'])): ?>
                            <div class="flex gap-1">
                                <button onclick="editAgendamento(<?= $agendamento['id'] ?>)" class="p-1 text-blue-600 hover:bg-blue-50 rounded">
                                    <i data-lucide="edit" class="w-4 h-4"></i>
                                </button>
                                <button onclick="deleteAgendamento(<?= $agendamento['id'] ?>)" class="p-1 text-red-600 hover:bg-red-50 rounded">
                                    <i data-lucide="trash-2" class="w-4 h-4"></i>
                                </button>
                            </div>
                        <?php endif; ?>
                    </div>
                </div>
            <?php endforeach; ?>
        </div>
    </div>
</div>

<!-- Modal Novo Agendamento -->
<?php if (in_array($userType, ['admin', 'assistente'])): ?>
<div id="modalNovoAgendamento" class="fixed inset-0 bg-black bg-opacity-50 z-50 hidden">
    <div class="flex items-center justify-center min-h-screen p-4">
        <div class="bg-white rounded-xl shadow-xl max-w-2xl w-full">
            <div class="p-6">
                <div class="flex justify-between items-center mb-6">
                    <h3 class="text-lg font-semibold text-gray-900">Novo Agendamento</h3>
                    <button onclick="closeModal('modalNovoAgendamento')" class="text-gray-400 hover:text-gray-600">
                        <i data-lucide="x" class="w-6 h-6"></i>
                    </button>
                </div>
                
                <?php if (isset($error)): ?>
                    <div class="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm mb-4">
                        <?= htmlspecialchars($error) ?>
                    </div>
                <?php endif; ?>
                
                <form method="POST" class="space-y-4">
                    <input type="hidden" name="action" value="create">
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Paciente *</label>
                            <select name="paciente_id" required 
                                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                                <option value="">Selecionar paciente</option>
                                <?php foreach ($pacientes as $paciente): ?>
                                    <option value="<?= $paciente['id'] ?>"><?= htmlspecialchars($paciente['nome_completo']) ?></option>
                                <?php endforeach; ?>
                            </select>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Profissional *</label>
                            <select name="profissional_id" required 
                                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                                <option value="">Selecionar profissional</option>
                                <?php foreach ($profissionais as $profissional): ?>
                                    <option value="<?= $profissional['id'] ?>"><?= htmlspecialchars($profissional['nome']) ?></option>
                                <?php endforeach; ?>
                            </select>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Tipo de Terapia *</label>
                            <select name="tipo_terapia_id" required 
                                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                                <option value="">Selecionar terapia</option>
                                <?php foreach ($tiposTerapia as $tipo): ?>
                                    <option value="<?= $tipo['id'] ?>"><?= htmlspecialchars($tipo['nome']) ?></option>
                                <?php endforeach; ?>
                            </select>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Data e Hora *</label>
                            <input type="datetime-local" name="data_hora_inicio" required 
                                   class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Duração (minutos)</label>
                            <select name="duracao" 
                                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                                <option value="30">30 minutos</option>
                                <option value="45">45 minutos</option>
                                <option value="60" selected>60 minutos</option>
                                <option value="90">90 minutos</option>
                            </select>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Frequência</label>
                            <select name="frequencia" 
                                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                                <option value="Única">Única</option>
                                <option value="Semanal">Semanal</option>
                                <option value="Quinzenal">Quinzenal</option>
                                <option value="Mensal">Mensal</option>
                            </select>
                        </div>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Observações</label>
                        <textarea name="observacoes" rows="3" 
                                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"></textarea>
                    </div>
                    
                    <div class="flex justify-end gap-3 pt-4">
                        <button type="button" onclick="closeModal('modalNovoAgendamento')" 
                                class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                            Cancelar
                        </button>
                        <button type="submit" 
                                class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                            Agendar
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

function viewAgendamento(id) {
    alert('Visualizar agendamento ID: ' + id);
}

function editAgendamento(id) {
    alert('Editar agendamento ID: ' + id);
}

function deleteAgendamento(id) {
    if (confirm('Tem certeza que deseja cancelar este agendamento?')) {
        // Implementar cancelamento
        alert('Cancelar agendamento ID: ' + id);
    }
}
</script>