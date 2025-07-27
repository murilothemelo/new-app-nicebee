<?php
require_once __DIR__ . '/../controllers/AuthController.php';
require_once __DIR__ . '/../controllers/PacientesController.php';

class Router {
    private $routes = [];
    
    public function addRoute($method, $path, $controller, $action) {
        $this->routes[] = [
            'method' => $method,
            'path' => $path,
            'controller' => $controller,
            'action' => $action
        ];
    }
    
    public function handleRequest() {
        $method = $_SERVER['REQUEST_METHOD'];
        $path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
        
        // Remove /api prefix if present
        $path = preg_replace('#^/api#', '', $path);
        
        foreach ($this->routes as $route) {
            if ($route['method'] === $method && $this->matchPath($route['path'], $path)) {
                $controller = new $route['controller']();
                $action = $route['action'];
                
                // Extract parameters from path
                $params = $this->extractParams($route['path'], $path);
                
                if (!empty($params)) {
                    return call_user_func_array([$controller, $action], $params);
                } else {
                    return $controller->$action();
                }
            }
        }
        
        // Route not found
        http_response_code(404);
        echo json_encode(['message' => 'Rota não encontrada']);
    }
    
    private function matchPath($routePath, $requestPath) {
        $routePattern = preg_replace('/\{[^}]+\}/', '([^/]+)', $routePath);
        $routePattern = '#^' . $routePattern . '$#';
        return preg_match($routePattern, $requestPath);
    }
    
    private function extractParams($routePath, $requestPath) {
        $routePattern = preg_replace('/\{[^}]+\}/', '([^/]+)', $routePath);
        $routePattern = '#^' . $routePattern . '$#';
        
        if (preg_match($routePattern, $requestPath, $matches)) {
            array_shift($matches); // Remove full match
            return $matches;
        }
        
        return [];
    }
}

// Definir rotas
$router = new Router();

// Auth routes
$router->addRoute('POST', '/login', 'AuthController', 'login');
$router->addRoute('POST', '/logout', 'AuthController', 'logout');
$router->addRoute('GET', '/user', 'AuthController', 'getCurrentUser');

// Pacientes routes
$router->addRoute('GET', '/pacientes', 'PacientesController', 'index');
$router->addRoute('GET', '/pacientes/{id}', 'PacientesController', 'show');
$router->addRoute('POST', '/pacientes', 'PacientesController', 'store');

return $router;
?>