<?php
// config.php - Configuración central del sistema

// Configuración de la aplicación
define('APP_NAME', 'Galería Juvenil Cristiana');
define('APP_VERSION', '1.0.0');
define('DEBUG', false); // Cambiar a true para development

// Configuración de autenticación
define('ADMIN_USERNAME', 'admin');
define('ADMIN_PASSWORD', 'admin123@');
define('SESSION_TIMEOUT', 86400); // 24 horas en segundos

// Configuración de archivos
define('UPLOAD_DIR', 'uploads/');
define('PHOTOS_JSON', 'photos.json');
define('MAX_FILE_SIZE', 10 * 1024 * 1024); // 10MB
define('ALLOWED_TYPES', ['image/jpeg', 'image/png', 'image/gif', 'image/webp']);
define('ALLOWED_EXTENSIONS', ['jpg', 'jpeg', 'png', 'gif', 'webp']);

// Configuración de la galería
define('DEFAULT_CATEGORY', 'fellowship');
define('AUTO_GENERATE_CONTENT', true); // Si generar automáticamente títulos y versículos
define('PHOTOS_PER_PAGE', 50); // Para futuras implementaciones de paginación

// Categorías disponibles
define('CATEGORIES', [
    'worship' => 'Alabanza',
    'fellowship' => 'Comunión', 
    'events' => 'Eventos',
    'service' => 'Servicio'
]);

// Configuración de la API de versículos
define('BIBLE_API_ENABLED', true);
define('BIBLE_API_TIMEOUT', 5); // segundos

// Configuración de seguridad
define('ENABLE_RATE_LIMITING', false); // Para implementaciones futuras
define('MAX_UPLOADS_PER_HOUR', 20);

// URLs y paths
$protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https://' : 'http://';
$host = $_SERVER['HTTP_HOST'] ?? 'localhost';
$baseUrl = $protocol . $host . dirname($_SERVER['REQUEST_URI'] ?? '');

define('BASE_URL', rtrim($baseUrl, '/'));
define('UPLOAD_URL', BASE_URL . '/' . UPLOAD_DIR);

// Función para obtener configuración
function getConfig($key, $default = null) {
    return defined($key) ? constant($key) : $default;
}

// Función para verificar si estamos en modo debug
function isDebug() {
    return getConfig('DEBUG', false);
}

// Función para log de errores
function logMessage($message, $level = 'INFO') {
    if (isDebug()) {
        $timestamp = date('Y-m-d H:i:s');
        $logEntry = "[$timestamp] [$level] $message" . PHP_EOL;
        error_log($logEntry, 3, 'app.log');
    }
}

// Configuración de zona horaria
date_default_timezone_set('America/Guatemala');

// Inicializar directorios necesarios
function initializeDirectories() {
    $dirs = [UPLOAD_DIR];
    
    foreach ($dirs as $dir) {
        if (!file_exists($dir)) {
            if (!mkdir($dir, 0755, true)) {
                logMessage("Failed to create directory: $dir", 'ERROR');
                return false;
            }
            logMessage("Created directory: $dir", 'INFO');
        }
    }
    
    return true;
}

// Configuración de headers de seguridad
function setSecurityHeaders() {
    // Prevenir XSS
    header('X-Content-Type-Options: nosniff');
    header('X-Frame-Options: SAMEORIGIN');
    header('X-XSS-Protection: 1; mode=block');
    
    // CORS para desarrollo local
    if (isDebug()) {
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, POST, OPTIONS, DELETE');
        header('Access-Control-Allow-Headers: Content-Type, Authorization');
    }
}

// Función para verificar requisitos del sistema
function checkSystemRequirements() {
    $requirements = [
        'PHP Version >= 7.4' => version_compare(PHP_VERSION, '7.4.0', '>='),
        'JSON Extension' => extension_loaded('json'),
        'GD Extension' => extension_loaded('gd'),
        'Upload Directory Writable' => is_writable(dirname(__FILE__)),
        'Sessions Enabled' => function_exists('session_start')
    ];
    
    $allMet = true;
    foreach ($requirements as $requirement => $met) {
        if (!$met) {
            logMessage("System requirement not met: $requirement", 'ERROR');
            $allMet = false;
        }
    }
    
    return $allMet;
}

// Función para obtener información del sistema
function getSystemInfo() {
    return [
        'app_name' => APP_NAME,
        'app_version' => APP_VERSION,
        'php_version' => PHP_VERSION,
        'server_software' => $_SERVER['SERVER_SOFTWARE'] ?? 'Unknown',
        'upload_max_filesize' => ini_get('upload_max_filesize'),
        'post_max_size' => ini_get('post_max_size'),
        'max_execution_time' => ini_get('max_execution_time'),
        'memory_limit' => ini_get('memory_limit'),
        'debug_mode' => isDebug(),
        'base_url' => BASE_URL
    ];
}

// Inicialización automática
if (!defined('SKIP_AUTO_INIT')) {
    // Verificar requisitos del sistema
    if (!checkSystemRequirements()) {
        if (isDebug()) {
            die('System requirements not met. Check logs for details.');
        } else {
            http_response_code(500);
            die('System configuration error.');
        }
    }
    
    // Inicializar directorios
    initializeDirectories();
    
    // Configurar headers de seguridad
    setSecurityHeaders();
    
    logMessage('System initialized successfully');
}
?>