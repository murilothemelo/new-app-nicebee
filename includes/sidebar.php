<!-- Overlay móvel -->
<div id="sidebar-overlay" class="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden hidden" onclick="toggleSidebar()"></div>

<!-- Sidebar -->
<div id="sidebar" class="fixed top-0 left-0 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-50 sidebar-closed lg:sidebar-open lg:static lg:shadow-none">
    <div class="flex flex-col h-full">
        <!-- Header -->
        <div class="p-6 border-b border-gray-200">
            <h2 class="text-xl font-bold text-gray-800">Clínica Terapêutica</h2>
            <p class="text-sm text-gray-600 mt-1"><?= htmlspecialchars($_SESSION['user_name']) ?></p>
            <span class="inline-block px-2 py-1 text-xs rounded-full mt-2 <?= 
                $_SESSION['user_type'] === 'admin' ? 'bg-red-100 text-red-800' :
                ($_SESSION['user_type'] === 'assistente' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800')
            ?>">
                <?= $_SESSION['user_type'] === 'admin' ? 'Administrador' :
                    ($_SESSION['user_type'] === 'assistente' ? 'Assistente' : 'Profissional') ?>
            </span>
        </div>

        <!-- Navigation -->
        <nav class="flex-1 p-4">
            <ul class="space-y-2">
                <?php
                $menuItems = [
                    ['icon' => 'layout-dashboard', 'label' => 'Dashboard', 'page' => 'dashboard', 'permission' => 'all'],
                    ['icon' => 'users', 'label' => 'Pacientes', 'page' => 'pacientes', 'permission' => 'all'],
                    ['icon' => 'folder-open', 'label' => 'Prontuário', 'page' => 'prontuario', 'permission' => 'all'],
                    ['icon' => 'calendar', 'label' => 'Agenda', 'page' => 'agenda', 'permission' => 'all'],
                    ['icon' => 'file-text', 'label' => 'Evoluções', 'page' => 'evolucoes', 'permission' => 'all'],
                    ['icon' => 'file-text', 'label' => 'Relatórios', 'page' => 'relatorios', 'permission' => 'all'],
                    ['icon' => 'message-square', 'label' => 'Comunidade', 'page' => 'comunidade', 'permission' => 'all'],
                    ['icon' => 'credit-card', 'label' => 'Planos Médicos', 'page' => 'planos', 'permission' => 'admin'],
                    ['icon' => 'heart', 'label' => 'Tipos de Terapia', 'page' => 'tipos-terapia', 'permission' => 'admin'],
                    ['icon' => 'user-check', 'label' => 'Acompanhantes', 'page' => 'acompanhantes', 'permission' => 'all'],
                    ['icon' => 'user-plus', 'label' => 'Usuários', 'page' => 'usuarios', 'permission' => 'admin']
                ];

                $currentPage = $_GET['page'] ?? 'dashboard';
                
                foreach ($menuItems as $item) {
                    // Verificar permissão
                    if ($item['permission'] === 'admin' && $_SESSION['user_type'] === 'profissional') {
                        continue;
                    }
                    
                    $isActive = $currentPage === $item['page'];
                    $activeClass = $isActive ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700' : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900';
                ?>
                    <li>
                        <a href="?page=<?= $item['page'] ?>" 
                           class="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors <?= $activeClass ?>"
                           onclick="closeSidebar()">
                            <i data-lucide="<?= $item['icon'] ?>" class="w-5 h-5"></i>
                            <span class="font-medium"><?= $item['label'] ?></span>
                        </a>
                    </li>
                <?php } ?>
            </ul>
        </nav>

        <!-- Footer -->
        <div class="p-4 border-t border-gray-200">
            <a href="?page=perfil" 
               class="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-gray-700 hover:bg-gray-50 hover:text-gray-900 mb-2"
               onclick="closeSidebar()">
                <i data-lucide="settings" class="w-5 h-5"></i>
                <span class="font-medium">Perfil</span>
            </a>
            <a href="logout.php" 
               class="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-red-600 hover:bg-red-50 w-full">
                <i data-lucide="log-out" class="w-5 h-5"></i>
                <span class="font-medium">Sair</span>
            </a>
        </div>
    </div>
</div>

<script>
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    
    if (sidebar.classList.contains('sidebar-closed')) {
        sidebar.classList.remove('sidebar-closed');
        sidebar.classList.add('sidebar-open');
        overlay.classList.remove('hidden');
    } else {
        sidebar.classList.remove('sidebar-open');
        sidebar.classList.add('sidebar-closed');
        overlay.classList.add('hidden');
    }
}

function closeSidebar() {
    if (window.innerWidth < 1024) {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebar-overlay');
        sidebar.classList.remove('sidebar-open');
        sidebar.classList.add('sidebar-closed');
        overlay.classList.add('hidden');
    }
}
</script>