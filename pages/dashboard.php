<?php
$db = getDB();
$userType = $_SESSION['user_type'];
$userId = $_SESSION['user_id'];

// Estatísticas baseadas no tipo de usuário
if ($userType === 'profissional') {
    // Estatísticas do profissional
    $stmt = $db->prepare("SELECT COUNT(*) as total FROM pacientes WHERE profissional_responsavel_id = ?");
    $stmt->execute([$userId]);
    $totalPacientes = $stmt->fetch()['total'];
    
    $stmt = $db->prepare("SELECT COUNT(*) as total FROM agendamentos WHERE profissional_id = ? AND DATE(data_hora_inicio) = CURDATE()");
    $stmt->execute([$userId]);
    $consultasHoje = $stmt->fetch()['total'];
    
    $stmt = $db->prepare("SELECT COUNT(*) as total FROM evolucoes WHERE profissional_id = ? AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)");
    $stmt->execute([$userId]);
    $evolucoesPendentes = $stmt->fetch()['total'];
    
    // Próxima consulta
    $stmt = $db->prepare("SELECT TIME(data_hora_inicio) as hora FROM agendamentos WHERE profissional_id = ? AND data_hora_inicio > NOW() ORDER BY data_hora_inicio LIMIT 1");
    $stmt->execute([$userId]);
    $proximaConsulta = $stmt->fetch()['hora'] ?? 'Nenhuma';
    
    $stats = [
        ['title' => 'Meus Pacientes', 'value' => $totalPacientes, 'color' => 'bg-blue-500'],
        ['title' => 'Consultas Hoje', 'value' => $consultasHoje, 'color' => 'bg-green-500'],
        ['title' => 'Evoluções Recentes', 'value' => $evolucoesPendentes, 'color' => 'bg-yellow-500'],
        ['title' => 'Próxima Consulta', 'value' => $proximaConsulta, 'color' => 'bg-purple-500']
    ];
} else {
    // Estatísticas gerais
    $stmt = $db->query("SELECT COUNT(*) as total FROM pacientes");
    $totalPacientes = $stmt->fetch()['total'];
    
    $stmt = $db->query("SELECT COUNT(*) as total FROM agendamentos WHERE DATE(data_hora_inicio) = CURDATE()");
    $consultasHoje = $stmt->fetch()['total'];
    
    $stmt = $db->query("SELECT COUNT(*) as total FROM usuarios WHERE tipo = 'profissional' AND status = 'ativo'");
    $profissionaisAtivos = $stmt->fetch()['total'];
    
    // Taxa de ocupação (simplificada)
    $stmt = $db->query("SELECT COUNT(*) as agendados FROM agendamentos WHERE DATE(data_hora_inicio) = CURDATE()");
    $agendados = $stmt->fetch()['agendados'];
    $taxaOcupacao = $agendados > 0 ? round(($agendados / 25) * 100) : 0; // Assumindo 25 slots por dia
    
    $stats = [
        ['title' => 'Total de Pacientes', 'value' => $totalPacientes, 'color' => 'bg-blue-500'],
        ['title' => 'Consultas Hoje', 'value' => $consultasHoje, 'color' => 'bg-green-500'],
        ['title' => 'Profissionais Ativos', 'value' => $profissionaisAtivos, 'color' => 'bg-red-500'],
        ['title' => 'Taxa de Ocupação', 'value' => $taxaOcupacao . '%', 'color' => 'bg-purple-500']
    ];
}

// Atividades recentes
$stmt = $db->prepare("
    SELECT 'evolucao' as tipo, e.created_at, p.nome_completo as paciente, u.nome as profissional
    FROM evolucoes e 
    JOIN pacientes p ON e.paciente_id = p.id 
    JOIN usuarios u ON e.profissional_id = u.id
    " . ($userType === 'profissional' ? "WHERE e.profissional_id = ?" : "") . "
    UNION ALL
    SELECT 'agendamento' as tipo, a.created_at, p.nome_completo as paciente, u.nome as profissional
    FROM agendamentos a 
    JOIN pacientes p ON a.paciente_id = p.id 
    JOIN usuarios u ON a.profissional_id = u.id
    " . ($userType === 'profissional' ? "WHERE a.profissional_id = ?" : "") . "
    ORDER BY created_at DESC LIMIT 5
");

if ($userType === 'profissional') {
    $stmt->execute([$userId, $userId]);
} else {
    $stmt->execute();
}
$atividades = $stmt->fetchAll();

// Próximas consultas
$stmt = $db->prepare("
    SELECT a.data_hora_inicio, p.nome_completo as paciente, tt.nome as terapia, u.nome as profissional
    FROM agendamentos a
    JOIN pacientes p ON a.paciente_id = p.id
    JOIN tipos_terapia tt ON a.tipo_terapia_id = tt.id
    JOIN usuarios u ON a.profissional_id = u.id
    WHERE a.data_hora_inicio > NOW() AND a.status IN ('Agendado', 'Confirmado')
    " . ($userType === 'profissional' ? "AND a.profissional_id = ?" : "") . "
    ORDER BY a.data_hora_inicio LIMIT 4
");

if ($userType === 'profissional') {
    $stmt->execute([$userId]);
} else {
    $stmt->execute();
}
$proximasConsultas = $stmt->fetchAll();
?>

<div class="space-y-6">
    <!-- Header -->
    <div>
        <h1 class="text-2xl font-bold text-gray-900">
            Bom dia, <?= explode(' ', $_SESSION['user_name'])[0] ?>!
        </h1>
        <p class="text-gray-600">
            Aqui está um resumo das suas atividades de hoje.
        </p>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <?php foreach ($stats as $stat): ?>
            <div class="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-sm font-medium text-gray-600"><?= $stat['title'] ?></p>
                        <p class="text-2xl font-bold text-gray-900 mt-2"><?= $stat['value'] ?></p>
                    </div>
                    <div class="w-12 h-12 <?= $stat['color'] ?> rounded-lg flex items-center justify-center">
                        <i data-lucide="users" class="w-6 h-6 text-white"></i>
                    </div>
                </div>
            </div>
        <?php endforeach; ?>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Recent Activities -->
        <div class="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Atividades Recentes</h3>
            <div class="space-y-4">
                <?php foreach ($atividades as $atividade): ?>
                    <div class="flex items-start gap-3">
                        <div class="w-2 h-2 rounded-full mt-2 <?= 
                            $atividade['tipo'] === 'evolucao' ? 'bg-blue-500' : 'bg-green-500'
                        ?>"></div>
                        <div class="flex-1">
                            <p class="text-sm font-medium text-gray-900">
                                <?= $atividade['tipo'] === 'evolucao' ? 'Nova evolução registrada' : 'Consulta agendada' ?>
                            </p>
                            <p class="text-sm text-gray-600"><?= htmlspecialchars($atividade['paciente']) ?></p>
                            <p class="text-xs text-gray-500 mt-1">
                                <?= formatDateTime($atividade['created_at'], 'H:i - d/m/Y') ?>
                            </p>
                        </div>
                    </div>
                <?php endforeach; ?>
            </div>
        </div>

        <!-- Upcoming Appointments -->
        <div class="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Próximas Consultas</h3>
            <div class="space-y-4">
                <?php foreach ($proximasConsultas as $consulta): ?>
                    <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                            <p class="text-sm font-medium text-gray-900"><?= htmlspecialchars($consulta['paciente']) ?></p>
                            <p class="text-xs text-gray-600"><?= htmlspecialchars($consulta['terapia']) ?></p>
                            <?php if ($userType !== 'profissional'): ?>
                                <p class="text-xs text-gray-500"><?= htmlspecialchars($consulta['profissional']) ?></p>
                            <?php endif; ?>
                        </div>
                        <div class="text-right">
                            <p class="text-sm font-medium text-blue-600">
                                <?= formatDateTime($consulta['data_hora_inicio'], 'H:i') ?>
                            </p>
                            <p class="text-xs text-gray-500">
                                <?= formatDate($consulta['data_hora_inicio']) ?>
                            </p>
                        </div>
                    </div>
                <?php endforeach; ?>
            </div>
        </div>
    </div>
</div>