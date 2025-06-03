<?php
// api.php - API principal para el sistema de galería
session_start();

// Configuración
define('ADMIN_USERNAME', 'admin');
define('ADMIN_PASSWORD', 'admin123@');
define('UPLOAD_DIR', 'uploads/');
define('PHOTOS_JSON', 'photos.json');
define('MAX_FILE_SIZE', 10 * 1024 * 1024); // 10MB
define('DEBUG', false); // Cambia a true para habilitar el log de errores

// Headers CORS y JSON
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS, DELETE');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Manejar preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Crear directorio de uploads si no existe
if (!file_exists(UPLOAD_DIR)) {
    mkdir(UPLOAD_DIR, 0755, true);
}

// Obtener la ruta desde el parámetro GET
$route = isset($_GET['route']) ? $_GET['route'] : '';

// Router principal
switch ($route) {
    case 'login':
        handleLogin();
        break;
    case 'logout':
        handleLogout();
        break;
    case 'status':
        handleStatus();
        break;
    case 'upload':
        handleUpload();
        break;
    case 'photos':
        handleGetPhotos();
        break;
    case 'delete':
        handleDeletePhoto();
        break;
    default:
        sendError(404, 'Endpoint no encontrado');
        break;
}

// =============================================================================
// FUNCIONES DE AUTENTICACIÓN
// =============================================================================

function handleLogin() {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        sendError(405, 'Método no permitido');
        return;
    }
    
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($input['username']) || !isset($input['password'])) {
        sendError(400, 'Usuario y contraseña requeridos');
        return;
    }
    
    if (validateCredentials($input['username'], $input['password'])) {
        $_SESSION['admin_logged_in'] = true;
        $_SESSION['admin_username'] = $input['username'];
        $_SESSION['login_time'] = time();
        
        sendSuccess([
            'message' => 'Autenticación exitosa',
            'user' => $input['username']
        ]);
    } else {
        sendError(401, 'Credenciales inválidas');
    }
}

function handleLogout() {
    session_destroy();
    sendSuccess(['message' => 'Sesión cerrada exitosamente']);
}

function handleStatus() {
    $isAuth = isAuthenticated();
    sendSuccess([
        'authenticated' => $isAuth,
        'user' => $isAuth ? $_SESSION['admin_username'] : null,
        'session_time' => $isAuth ? ($_SESSION['login_time'] ?? null) : null
    ]);
}

// =============================================================================
// FUNCIONES DE GESTIÓN DE FOTOS
// =============================================================================

function handleUpload() {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        sendError(405, 'Método no permitido');
        return;
    }
    
    if (!isAuthenticated()) {
        sendError(401, 'Acceso no autorizado');
        return;
    }
    
    // Validar que se envió un archivo
    if (!isset($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
        sendError(400, 'Error en la subida del archivo');
        return;
    }
    
    $file = $_FILES['image'];
    
    // Validaciones del archivo
    if (!isValidImage($file)) {
        sendError(400, 'Archivo no válido. Solo se permiten imágenes (JPEG, PNG, GIF, WebP) menores a 10MB');
        return;
    }
    
    // Generar nombre único y mover archivo
    $filename = generateUniqueFilename($file['name']);
    $uploadPath = UPLOAD_DIR . $filename;
    
    if (!move_uploaded_file($file['tmp_name'], $uploadPath)) {
        sendError(500, 'Error al guardar el archivo en el servidor');
        return;
    }
    
    // Crear registro de la foto
    $photoData = [
        'id' => generatePhotoId(),
        'filename' => $filename,
        'original_name' => sanitizeInput($file['name']),
        'title' => sanitizeInput($_POST['title'] ?? 'Imagen sin título'),
        'description' => sanitizeInput($_POST['description'] ?? 'Sin descripción'),
        'category' => validateCategory($_POST['category'] ?? 'fellowship'),
        'verse' => sanitizeInput($_POST['verse'] ?? 'Salmos 1:1'),
        'upload_date' => date('Y-m-d H:i:s'),
        'uploaded_by' => $_SESSION['admin_username'],
        'file_size' => $file['size'],
        'mime_type' => $file['type'],
        'src' => '/' . UPLOAD_DIR . $filename,
        'thumbnail' => '/' . UPLOAD_DIR . $filename
    ];
    
    // Guardar en archivo JSON
    if (savePhotoRecord($photoData)) {
        sendSuccess([
            'message' => 'Imagen subida exitosamente',
            'photo' => $photoData
        ]);
    } else {
        // Si falla el guardado, eliminar archivo físico
        unlink($uploadPath);
        sendError(500, 'Error al guardar la información de la foto');
    }
}

function handleGetPhotos() {
    $photos = loadPhotos();
    
    // Filtrar información sensible si no está autenticado
    if (!isAuthenticated()) {
        $photos = array_map(function($photo) {
            return [
                'id' => $photo['id'],
                'title' => $photo['title'],
                'description' => $photo['description'],
                'category' => $photo['category'],
                'verse' => $photo['verse'],
                'src' => $photo['src'],
                'thumbnail' => $photo['thumbnail']
            ];
        }, $photos);
    }
    
    sendSuccess([
        'photos' => $photos,
        'total' => count($photos)
    ]);
}

function handleDeletePhoto() {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        sendError(405, 'Método no permitido');
        return;
    }
    
    if (!isAuthenticated()) {
        sendError(401, 'Acceso no autorizado');
        return;
    }
    
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($input['id'])) {
        sendError(400, 'ID de foto requerido');
        return;
    }
    
    $photoId = (int)$input['id'];
    $photos = loadPhotos();
    
    // Buscar la foto a eliminar
    $photoToDelete = null;
    $photoIndex = -1;
    
    foreach ($photos as $index => $photo) {
        if ($photo['id'] === $photoId) {
            $photoToDelete = $photo;
            $photoIndex = $index;
            break;
        }
    }
    
    if (!$photoToDelete) {
        sendError(404, 'Foto no encontrada');
        return;
    }
    
    // Eliminar archivo físico
    $filePath = UPLOAD_DIR . $photoToDelete['filename'];
    if (file_exists($filePath)) {
        unlink($filePath);
    }
    
    // Eliminar del array y guardar
    unset($photos[$photoIndex]);
    $photos = array_values($photos); // Reindexar array
    
    if (savePhotos($photos)) {
        sendSuccess(['message' => 'Foto eliminada exitosamente']);
    } else {
        sendError(500, 'Error al actualizar la base de datos');
    }
}

// =============================================================================
// FUNCIONES AUXILIARES
// =============================================================================

function isAuthenticated() {
    return isset($_SESSION['admin_logged_in']) && 
           $_SESSION['admin_logged_in'] === true &&
           isset($_SESSION['login_time']) &&
           (time() - $_SESSION['login_time']) < 86400; // 24 horas
}

function validateCredentials($username, $password) {
    return $username === ADMIN_USERNAME && $password === ADMIN_PASSWORD;
}

function isValidImage($file) {
    $allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    $allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    
    // Verificar tipo MIME
    if (!in_array($file['type'], $allowedTypes)) {
        return false;
    }
    
    // Verificar extensión
    $extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    if (!in_array($extension, $allowedExtensions)) {
        return false;
    }
    
    // Verificar tamaño
    if ($file['size'] > MAX_FILE_SIZE) {
        return false;
    }
    
    // Verificar que realmente es una imagen
    $imageInfo = getimagesize($file['tmp_name']);
    if ($imageInfo === false) {
        return false;
    }
    
    return true;
}

function generateUniqueFilename($originalName) {
    $extension = strtolower(pathinfo($originalName, PATHINFO_EXTENSION));
    $timestamp = time();
    $random = mt_rand(100000, 999999);
    return "img_{$timestamp}_{$random}.{$extension}";
}

function generatePhotoId() {
    return time() . mt_rand(1000, 9999);
}

function sanitizeInput($input) {
    return htmlspecialchars(trim($input), ENT_QUOTES, 'UTF-8');
}

function validateCategory($category) {
    $validCategories = ['worship', 'fellowship', 'events', 'service'];
    return in_array($category, $validCategories) ? $category : 'fellowship';
}

function loadPhotos() {
    if (!file_exists(PHOTOS_JSON)) {
        return [];
    }
    
    $content = file_get_contents(PHOTOS_JSON);
    $photos = json_decode($content, true);
    
    return is_array($photos) ? $photos : [];
}

function savePhotos($photos) {
    $jsonData = json_encode($photos, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    return file_put_contents(PHOTOS_JSON, $jsonData) !== false;
}

function savePhotoRecord($photoData) {
    $photos = loadPhotos();
    $photos[] = $photoData;
    return savePhotos($photos);
}

function sendSuccess($data = []) {
    echo json_encode(array_merge(['success' => true], $data));
    exit;
}

function sendError($code, $message) {
    http_response_code($code);
    echo json_encode([
        'success' => false,
        'error' => $message,
        'code' => $code
    ]);
    exit;
}

// Log de errores para debugging (solo en desarrollo)
function logError($message) {
    if (defined('DEBUG') && DEBUG) {
        error_log("[Gallery API] " . $message);
    }
}
?>