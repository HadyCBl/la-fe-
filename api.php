<?php
// api.php - API principal para el sistema de galería
require_once 'config.php';

session_start();

// Headers CORS y JSON
header('Content-Type: application/json');

// Manejar preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Crear directorio de uploads si no existe (ya manejado en config.php)
logMessage("API initialized for route: $route");

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
    case 'bulk-upload':
        handleBulkUpload();
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

function handleBulkUpload() {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        sendError(405, 'Método no permitido');
        return;
    }
    
    if (!isAuthenticated()) {
        sendError(401, 'Acceso no autorizado');
        return;
    }
    
    // Verificar que se enviaron archivos
    if (!isset($_FILES['images']) || !is_array($_FILES['images']['name'])) {
        sendError(400, 'No se encontraron archivos para subir');
        return;
    }
    
    $category = validateCategory($_POST['category'] ?? 'fellowship');
    $baseDescription = sanitizeInput($_POST['description'] ?? 'Imagen del ministerio juvenil');
    
    $uploadedFiles = [];
    $errors = [];
    
    // Procesar cada archivo
    for ($i = 0; $i < count($_FILES['images']['name']); $i++) {
        $file = [
            'name' => $_FILES['images']['name'][$i],
            'type' => $_FILES['images']['type'][$i],
            'tmp_name' => $_FILES['images']['tmp_name'][$i],
            'error' => $_FILES['images']['error'][$i],
            'size' => $_FILES['images']['size'][$i]
        ];
        
        if ($file['error'] !== UPLOAD_ERR_OK) {
            $errors[] = "Error en archivo {$file['name']}";
            continue;
        }
        
        if (!isValidImage($file)) {
            $errors[] = "Archivo {$file['name']} no es válido";
            continue;
        }
        
        // Generar nombre único y mover archivo
        $filename = generateUniqueFilename($file['name']);
        $uploadPath = UPLOAD_DIR . $filename;
        
        if (move_uploaded_file($file['tmp_name'], $uploadPath)) {
            // Generar contenido automático para cada foto
            $bibleData = getRandomBibleContent($category);
            
            $photoData = [
                'id' => generatePhotoId(),
                'filename' => $filename,
                'original_name' => sanitizeInput($file['name']),
                'title' => $bibleData['title'],
                'description' => $baseDescription,
                'category' => $category,
                'verse' => $bibleData['verse'],
                'verse_text' => $bibleData['text'],
                'upload_date' => date('Y-m-d H:i:s'),
                'uploaded_by' => $_SESSION['admin_username'],
                'file_size' => $file['size'],
                'mime_type' => $file['type'],
                'src' => '/' . UPLOAD_DIR . $filename,
                'thumbnail' => '/' . UPLOAD_DIR . $filename
            ];
            
            if (savePhotoRecord($photoData)) {
                $uploadedFiles[] = $photoData;
            } else {
                unlink($uploadPath);
                $errors[] = "Error guardando información de {$file['name']}";
            }
            
        } else {
            $errors[] = "Error al subir {$file['name']}";
        }
    }
    
    sendSuccess([
        'message' => 'Carga masiva completada',
        'uploaded' => count($uploadedFiles),
        'errors' => count($errors),
        'files' => $uploadedFiles,
        'error_details' => $errors
    ]);
}

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
    
    // Crear registro de la foto con datos automáticos si están vacíos
    $bibleData = null;
    if (empty($_POST['title']) || empty($_POST['verse'])) {
        $bibleData = getRandomBibleContent($_POST['category'] ?? 'fellowship');
    }
    
    $photoData = [
        'id' => generatePhotoId(),
        'filename' => $filename,
        'original_name' => sanitizeInput($file['name']),
        'title' => sanitizeInput($_POST['title']) ?: ($bibleData['title'] ?? 'Momento Especial'),
        'description' => sanitizeInput($_POST['description'] ?? 'Una bendición capturada en imagen'),
        'category' => validateCategory($_POST['category'] ?? 'fellowship'),
        'verse' => sanitizeInput($_POST['verse']) ?: ($bibleData['verse'] ?? 'Salmos 1:1'),
        'verse_text' => $bibleData['text'] ?? null,
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

function getRandomBibleContent($category) {
    // Función interna para obtener contenido bíblico aleatorio
    $bibleVerses = [
        'worship' => [
            ['verse' => 'Salmos 95:1', 'title' => 'Corazones en Adoración'],
            ['verse' => 'Salmos 150:6', 'title' => 'Alabanza que Trasciende'],
            ['verse' => 'Juan 4:24', 'title' => 'En Su Presencia'],
            ['verse' => 'Salmos 100:2', 'title' => 'Voces que Alaban']
        ],
        'fellowship' => [
            ['verse' => 'Hebreos 10:25', 'title' => 'Unidos en Cristo'],
            ['verse' => 'Proverbios 27:17', 'title' => 'Hermanos en Fe'],
            ['verse' => '1 Juan 1:7', 'title' => 'Comunión Verdadera'],
            ['verse' => 'Gálatas 6:2', 'title' => 'Lazos Eternos']
        ],
        'events' => [
            ['verse' => 'Deuteronomio 31:6', 'title' => 'Momentos Especiales'],
            ['verse' => 'Josué 1:9', 'title' => 'Recuerdos de Fe'],
            ['verse' => 'Isaías 40:31', 'title' => 'Experiencias Transformadoras'],
            ['verse' => 'Filipenses 4:13', 'title' => 'Encuentros Divinos']
        ],
        'service' => [
            ['verse' => 'Marcos 16:15', 'title' => 'Manos que Sirven'],
            ['verse' => 'Mateo 28:19', 'title' => 'Corazón de Siervo'],
            ['verse' => '1 Pedro 4:10', 'title' => 'Amor en Acción'],
            ['verse' => 'Gálatas 5:13', 'title' => 'Sirviendo con Gozo']
        ]
    ];
    
    // Si la categoría no existe, usar 'fellowship'
    if (!isset($bibleVerses[$category])) {
        $category = 'fellowship';
    }
    
    $options = $bibleVerses[$category];
    $selected = $options[array_rand($options)];
    
    return [
        'title' => $selected['title'],
        'verse' => $selected['verse'],
        'text' => '' // Texto completo se puede agregar después si es necesario
    ];
}

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

