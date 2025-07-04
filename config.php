<?php
// config.php - Configuración central del sistema

// Configuración de errores para desarrollo
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Configuración de la aplicación
define('APP_NAME', 'Galería Juvenil Cristiana');
define('APP_VERSION', '1.0.0');
define('DEBUG', true); // Cambiar a false para producción

// Configuración de autenticación
define('ADMIN_USERNAME', 'admin');
define('ADMIN_PASSWORD', 'admin123@');
define('SESSION_TIMEOUT', 86400); // 24 horas en segundos

// Configuración de archivos
define('UPLOAD_DIR', 'uploads/');
define('PHOTOS_JSON', 'photos.json');
define('MAX_FILE_SIZE', 10 * 1024 * 1024); // 10MB

// Configuración de la galería
define('DEFAULT_CATEGORY', 'fellowship');
define('AUTO_GENERATE_CONTENT', true);
define('PHOTOS_PER_PAGE', 50);

// Categorías disponibles
define('CATEGORIES', [
    'worship' => 'Alabanza',
    'fellowship' => 'Comunión', 
    'events' => 'Eventos',
    'service' => 'Servicio'
]);

// Configuración de la API de versículos
define('BIBLE_API_ENABLED', true);
define('BIBLE_API_TIMEOUT', 5);

// Configuración de zona horaria
date_default_timezone_set('America/Guatemala');

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
        header('Access-Control-Allow-Credentials: true');
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
    if (!initializeDirectories()) {
        if (isDebug()) {
            die('Failed to initialize directories. Check permissions.');
        } else {
            http_response_code(500);
            die('System initialization error.');
        }
    }
    
    // Configurar headers de seguridad
    setSecurityHeaders();
    
    logMessage('System initialized successfully');
}

// Función para inicializar el archivo de fotos si no existe
function initializePhotosFile() {
    if (!file_exists(PHOTOS_JSON)) {
        $initialData = [];
        file_put_contents(PHOTOS_JSON, json_encode($initialData, JSON_PRETTY_PRINT));
        logMessage('Photos JSON file created');
    }
}

// Inicializar archivo de fotos
initializePhotosFile();
?>