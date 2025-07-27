<?php
session_start();

// Verificar se o usuário está logado
if (!isset($_SESSION['user_id'])) {
    header('Location: login.php');
    exit;
}

require_once 'config/database.php';
require_once 'includes/functions.php';

$user = getUserById($_SESSION['user_id']);
$page = $_GET['page'] ?? 'dashboard';

// Verificar permissões
if (!hasPermission($user['tipo'], $page)) {
    $page = 'dashboard';
}

include 'includes/header.php';
include 'includes/sidebar.php';
?>

<main class="lg:ml-64 p-6">
    <?php
    switch ($page) {
        case 'dashboard':
            include 'pages/dashboard.php';
            break;
        case 'pacientes':
            include 'pages/pacientes.php';
            break;
        case 'prontuario':
            include 'pages/prontuario.php';
            break;
        case 'agenda':
            include 'pages/agenda.php';
            break;
        case 'evolucoes':
            include 'pages/evolucoes.php';
            break;
        case 'relatorios':
            include 'pages/relatorios.php';
            break;
        case 'comunidade':
            include 'pages/comunidade.php';
            break;
        case 'planos':
            include 'pages/planos.php';
            break;
        case 'tipos-terapia':
            include 'pages/tipos-terapia.php';
            break;
        case 'acompanhantes':
            include 'pages/acompanhantes.php';
            break;
        case 'usuarios':
            include 'pages/usuarios.php';
            break;
        case 'perfil':
            include 'pages/perfil.php';
            break;
        default:
            include 'pages/dashboard.php';
    }
    ?>
</main>

<?php include 'includes/footer.php'; ?>