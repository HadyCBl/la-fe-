<?php
// config.php
session_start();

// Configuración
define('ADMIN_USERNAME', 'admin');
define('ADMIN_PASSWORD', 'admin123@');
define('UPLOAD_DIR', 'uploads/');
define('MAX_FILE_SIZE', 50 * 1024 * 1024); // 50MB para fotos de alta calidad

// Crear directorio de uploads si no existe
if (!file_exists(UPLOAD_DIR)) {
    mkdir(UPLOAD_DIR, 0777, true);
}

// Función para verificar autenticación
function isAuthenticated() {
    return isset($_SESSION['admin_logged_in']) && $_SESSION['admin_logged_in'] === true;
}

// Función para verificar credenciales
function validateCredentials($username, $password) {
    return $username === ADMIN_USERNAME && $password === ADMIN_PASSWORD;
}

// Función para generar nombre único de archivo
function generateUniqueFilename($originalName) {
    $extension = pathinfo($originalName, PATHINFO_EXTENSION);
    $timestamp = time();
    $random = mt_rand(1000, 9999);
    return "img_{$timestamp}_{$random}.{$extension}";
}

// Función para validar imagen
function isValidImage($file) {
    $allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    $maxSize = MAX_FILE_SIZE;
    
    if (!in_array($file['type'], $allowedTypes)) {
        return false;
    }
    
    if ($file['size'] > $maxSize) {
        return false;
    }
    
    return true;
}

// Headers para JSON
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Manejar OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Ruteo básico
$request = $_SERVER['REQUEST_URI'];
$path = parse_url($request, PHP_URL_PATH);

switch ($path) {
    case '/api/login':
        handleLogin();
        break;
    case '/api/logout':
        handleLogout();
        break;
    case '/api/upload':
        handleUpload();
        break;
    case '/api/photos':
        handleGetPhotos();
        break;
    case '/api/delete':
        handleDeletePhoto();
        break;
    case '/api/status':
        handleStatus();
        break;
    default:
        http_response_code(404);
        echo json_encode(['error' => 'Endpoint no encontrado']);
        break;
}

function handleLogin() {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode(['error' => 'Método no permitido']);
        return;
    }
    
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($input['username']) || !isset($input['password'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Usuario y contraseña requeridos']);
        return;
    }
    
    if (validateCredentials($input['username'], $input['password'])) {
        $_SESSION['admin_logged_in'] = true;
        $_SESSION['admin_username'] = $input['username'];
        echo json_encode([
            'success' => true,
            'message' => 'Autenticación exitosa',
            'user' => $input['username']
        ]);
    } else {
        http_response_code(401);
        echo json_encode(['error' => 'Credenciales inválidas']);
    }
}

function handleLogout() {
    session_destroy();
    echo json_encode(['success' => true, 'message' => 'Sesión cerrada']);
}

function handleStatus() {
    echo json_encode([
        'authenticated' => isAuthenticated(),
        'user' => isAuthenticated() ? $_SESSION['admin_username'] : null
    ]);
}

function handleUpload() {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode(['error' => 'Método no permitido']);
        return;
    }
    
    if (!isAuthenticated()) {
        http_response_code(401);
        echo json_encode(['error' => 'No autenticado']);
        return;
    }
    
    if (!isset($_FILES['image'])) {
        http_response_code(400);
        echo json_encode(['error' => 'No se encontró archivo de imagen']);
        return;
    }
    
    $file = $_FILES['image'];
    
    if ($file['error'] !== UPLOAD_ERR_OK) {
        http_response_code(400);
        echo json_encode(['error' => 'Error en la subida del archivo']);
        return;
    }
    
    if (!isValidImage($file)) {
        http_response_code(400);
        echo json_encode(['error' => 'Archivo no válido. Solo se permiten imágenes (JPEG, PNG, GIF, WebP) menores a 10MB']);
        return;
    }
    
    // Generar nombre único
    $filename = generateUniqueFilename($file['name']);
    $uploadPath = UPLOAD_DIR . $filename;
    
    if (move_uploaded_file($file['tmp_name'], $uploadPath)) {
        // Obtener datos adicionales del POST
        $title = $_POST['title'] ?? 'Imagen sin título';
        $description = $_POST['description'] ?? 'Sin descripción';
        $category = $_POST['category'] ?? 'fellowship';
        $verse = $_POST['verse'] ?? 'Salmos 1:1';
        
        // Guardar información en archivo JSON
        $photoData = [
            'id' => time(),
            'filename' => $filename,
            'original_name' => $file['name'],
            'title' => $title,
            'description' => $description,
            'category' => $category,
            'verse' => $verse,
            'upload_date' => date('Y-m-d H:i:s'),
            'src' => '/uploads/' . $filename,
            'thumbnail' => '/uploads/' . $filename // En un futuro podrías generar thumbnails
        ];
        
        // Leer fotos existentes
        $photosFile = 'photos.json';
        $photos = [];
        if (file_exists($photosFile)) {
            $photos = json_decode(file_get_contents($photosFile), true) ?: [];
        }
        
        // Agregar nueva foto
        $photos[] = $photoData;
        
        // Guardar archivo actualizado
        file_put_contents($photosFile, json_encode($photos, JSON_PRETTY_PRINT));
        
        echo json_encode([
            'success' => true,
            'message' => 'Imagen subida exitosamente',
            'photo' => $photoData
        ]);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Error al guardar el archivo']);
    }
}

function handleGetPhotos() {
    $photosFile = 'photos.json';
    
    if (file_exists($photosFile)) {
        $photos = json_decode(file_get_contents($photosFile), true) ?: [];
        echo json_encode(['photos' => $photos]);
    } else {
        echo json_encode(['photos' => []]);
    }
}

function handleDeletePhoto() {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode(['error' => 'Método no permitido']);
        return;
    }
    
    if (!isAuthenticated()) {
        http_response_code(401);
        echo json_encode(['error' => 'No autenticado']);
        return;
    }
    
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($input['id'])) {
        http_response_code(400);
        echo json_encode(['error' => 'ID de foto requerido']);
        return;
    }
    
    $photoId = $input['id'];
    $photosFile = 'photos.json';
    
    if (file_exists($photosFile)) {
        $photos = json_decode(file_get_contents($photosFile), true) ?: [];
        
        // Buscar y eliminar foto
        $photoToDelete = null;
        $photos = array_filter($photos, function($photo) use ($photoId, &$photoToDelete) {
            if ($photo['id'] == $photoId) {
                $photoToDelete = $photo;
                return false;
            }
            return true;
        });
        
        if ($photoToDelete) {
            // Eliminar archivo físico
            $filePath = UPLOAD_DIR . $photoToDelete['filename'];
            if (file_exists($filePath)) {
                unlink($filePath);
            }
            
            // Guardar archivo actualizado
            file_put_contents($photosFile, json_encode(array_values($photos), JSON_PRETTY_PRINT));
            
            echo json_encode([
                'success' => true,
                'message' => 'Foto eliminada exitosamente'
            ]);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Foto no encontrada']);
        }
    } else {
        http_response_code(404);
        echo json_encode(['error' => 'No hay fotos para eliminar']);
    }
}
?>