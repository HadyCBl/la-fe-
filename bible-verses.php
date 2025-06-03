<?php
// bible-verses.php - API de versículos bíblicos para el ministerio juvenil

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Diccionario de versículos bíblicos categorizados
$bibleVerses = [
    'worship' => [
        [
            'verse' => 'Salmos 95:1',
            'text' => 'Venid, aclamemos alegremente a Jehová; cantemos con júbilo a la roca de nuestra salvación.'
        ],
        [
            'verse' => 'Salmos 150:6',
            'text' => 'Todo lo que respira alabe a JAH. Aleluya.'
        ],
        [
            'verse' => 'Juan 4:24',
            'text' => 'Dios es Espíritu; y los que le adoran, en espíritu y en verdad es necesario que adoren.'
        ],
        [
            'verse' => 'Salmos 100:2',
            'text' => 'Servid a Jehová con alegría; venid ante su presencia con regocijo.'
        ],
        [
            'verse' => 'Apocalipsis 4:11',
            'text' => 'Señor, digno eres de recibir la gloria y la honra y el poder; porque tú creaste todas las cosas.'
        ],
        [
            'verse' => 'Salmos 96:9',
            'text' => 'Adorad a Jehová en la hermosura de la santidad; temed delante de él, toda la tierra.'
        ],
        [
            'verse' => 'Hebreos 13:15',
            'text' => 'Así que, ofrezcamos siempre a Dios, por medio de él, sacrificio de alabanza.'
        ],
        [
            'verse' => 'Salmos 103:1',
            'text' => 'Bendice, alma mía, a Jehová, y bendiga todo mi ser su santo nombre.'
        ]
    ],
    'fellowship' => [
        [
            'verse' => 'Hebreos 10:25',
            'text' => 'No dejando de congregarnos, como algunos tienen por costumbre, sino exhortándonos.'
        ],
        [
            'verse' => 'Proverbios 27:17',
            'text' => 'Hierro con hierro se aguza; y así el hombre aguza el rostro de su amigo.'
        ],
        [
            'verse' => '1 Juan 1:7',
            'text' => 'Pero si andamos en luz, como él está en luz, tenemos comunión unos con otros.'
        ],
        [
            'verse' => 'Gálatas 6:2',
            'text' => 'Sobrellevad los unos las cargas de los otros, y cumplid así la ley de Cristo.'
        ],
        [
            'verse' => 'Eclesiastés 4:12',
            'text' => 'Y cordón de tres dobleces no se rompe pronto.'
        ],
        [
            'verse' => 'Romanos 12:10',
            'text' => 'Amaos los unos a los otros con amor fraternal; en cuanto a honra, prefiriéndoos los unos a los otros.'
        ],
        [
            'verse' => '1 Tesalonicenses 5:11',
            'text' => 'Por lo cual, animaos unos a otros, y edificaos unos a otros, así como lo hacéis.'
        ],
        [
            'verse' => 'Filipenses 2:2',
            'text' => 'Completad mi gozo, sintiendo lo mismo, teniendo el mismo amor, unánimes, sintiendo una misma cosa.'
        ]
    ],
    'events' => [
        [
            'verse' => 'Deuteronomio 31:6',
            'text' => 'Esforzaos y cobrad ánimo; no temáis, ni tengáis miedo de ellos, porque Jehová tu Dios es el que va contigo.'
        ],
        [
            'verse' => 'Josué 1:9',
            'text' => 'Mira que te mando que te esfuerces y seas valiente; no temas ni desmayes, porque Jehová tu Dios estará contigo.'
        ],
        [
            'verse' => 'Isaías 40:31',
            'text' => 'Pero los que esperan a Jehová tendrán nuevas fuerzas; levantarán alas como las águilas.'
        ],
        [
            'verse' => 'Filipenses 4:13',
            'text' => 'Todo lo puedo en Cristo que me fortalece.'
        ],
        [
            'verse' => '2 Timoteo 1:7',
            'text' => 'Porque no nos ha dado Dios espíritu de cobardía, sino de poder, de amor y de dominio propio.'
        ],
        [
            'verse' => 'Jeremías 29:11',
            'text' => 'Porque yo sé los pensamientos que tengo acerca de vosotros, dice Jehová, pensamientos de paz.'
        ],
        [
            'verse' => 'Proverbios 3:5-6',
            'text' => 'Fíate de Jehová de todo tu corazón, y no te apoyes en tu propia prudencia.'
        ],
        [
            'verse' => 'Salmos 118:24',
            'text' => 'Este es el día que hizo Jehová; nos gozaremos y alegraremos en él.'
        ]
    ],
    'service' => [
        [
            'verse' => 'Marcos 16:15',
            'text' => 'Y les dijo: Id por todo el mundo y predicad el evangelio a toda criatura.'
        ],
        [
            'verse' => 'Mateo 28:19',
            'text' => 'Por tanto, id, y haced discípulos a todas las naciones, bautizándolos en el nombre del Padre.'
        ],
        [
            'verse' => '1 Pedro 4:10',
            'text' => 'Cada uno según el don que ha recibido, minístrelo a los otros, como buenos administradores.'
        ],
        [
            'verse' => 'Gálatas 5:13',
            'text' => 'Porque vosotros, hermanos, a libertad fuisteis llamados; solamente que no uséis la libertad como ocasión para la carne, sino servíos por amor los unos a los otros.'
        ],
        [
            'verse' => 'Mateo 20:28',
            'text' => 'Como el Hijo del Hombre no vino para ser servido, sino para servir, y para dar su vida en rescate por muchos.'
        ],
        [
            'verse' => 'Juan 13:14',
            'text' => 'Pues si yo, el Señor y el Maestro, he lavado vuestros pies, vosotros también debéis lavaros los pies los unos a los otros.'
        ],
        [
            'verse' => 'Romanos 12:1',
            'text' => 'Así que, hermanos, os ruego por las misericordias de Dios, que presentéis vuestros cuerpos en sacrificio vivo.'
        ],
        [
            'verse' => '2 Corintios 9:7',
            'text' => 'Cada uno dé como propuso en su corazón: no con tristeza, ni por necesidad, porque Dios ama al dador alegre.'
        ]
    ],
    'youth' => [
        [
            'verse' => '1 Timoteo 4:12',
            'text' => 'Ninguno tenga en poco tu juventud, sino sé ejemplo de los creyentes en palabra, conducta, amor, espíritu, fe y pureza.'
        ],
        [
            'verse' => 'Eclesiastés 12:1',
            'text' => 'Acuérdate de tu Creador en los días de tu juventud, antes que vengan los días malos.'
        ],
        [
            'verse' => 'Salmos 119:9',
            'text' => '¿Con qué limpiará el joven su camino? Con guardar tu palabra.'
        ],
        [
            'verse' => 'Proverbios 20:29',
            'text' => 'La gloria de los jóvenes es su fuerza, y la hermosura de los ancianos es su vejez.'
        ],
        [
            'verse' => 'Joel 2:28',
            'text' => 'Y después de esto derramaré mi Espíritu sobre toda carne, y profetizarán vuestros hijos y vuestras hijas.'
        ],
        [
            'verse' => 'Lamentaciones 3:27',
            'text' => 'Bueno le es al hombre llevar el yugo desde su juventud.'
        ]
    ],
    'general' => [
        [
            'verse' => 'Juan 3:16',
            'text' => 'Porque de tal manera amó Dios al mundo, que ha dado a su Hijo unigénito, para que todo aquel que en él cree, no se pierda, mas tenga vida eterna.'
        ],
        [
            'verse' => 'Romanos 8:28',
            'text' => 'Y sabemos que a los que aman a Dios, todas las cosas les ayudan a bien.'
        ],
        [
            'verse' => 'Salmos 23:1',
            'text' => 'Jehová es mi pastor; nada me faltará.'
        ],
        [
            'verse' => 'Isaías 41:10',
            'text' => 'No temas, porque yo estoy contigo; no desmayes, porque yo soy tu Dios que te esfuerzo.'
        ],
        [
            'verse' => 'Salmos 46:10',
            'text' => 'Estad quietos, y conoced que yo soy Dios; seré exaltado entre las naciones.'
        ],
        [
            'verse' => 'Mateo 6:33',
            'text' => 'Mas buscad primeramente el reino de Dios y su justicia, y todas estas cosas os serán añadidas.'
        ]
    ]
];

// Títulos inspiradores por categoría
$inspirationalTitles = [
    'worship' => [
        'Corazones en Adoración',
        'Alabanza que Trasciende',
        'En Su Presencia',
        'Voces que Alaban',
        'Adoración Celestial',
        'Manos Alzadas al Cielo',
        'Cánticos de Esperanza',
        'Momentos de Gloria'
    ],
    'fellowship' => [
        'Unidos en Cristo',
        'Hermanos en Fe',
        'Comunión Verdadera',
        'Lazos Eternos',
        'Familia de la Fe',
        'Corazones Unidos',
        'Amistad Divina',
        'Caminando Juntos'
    ],
    'events' => [
        'Momentos Especiales',
        'Recuerdos de Fe',
        'Experiencias Transformadoras',
        'Encuentros Divinos',
        'Celebración de Vida',
        'Aventuras de Fe',
        'Testimonios Vivientes',
        'Huellas de Bendición'
    ],
    'service' => [
        'Manos que Sirven',
        'Corazón de Siervo',
        'Amor en Acción',
        'Sirviendo con Gozo',
        'Misión Cumplida',
        'Compasión Cristiana',
        'Entrega Total',
        'Fe que Actúa'
    ]
];

// Obtener la acción solicitada
$action = $_GET['action'] ?? 'random';
$category = $_GET['category'] ?? 'general';

switch ($action) {
    case 'random':
        getRandomVerse($bibleVerses, $category);
        break;
    case 'title':
        getRandomTitle($inspirationalTitles, $category);
        break;
    case 'both':
        getBothTitleAndVerse($bibleVerses, $inspirationalTitles, $category);
        break;
    case 'categories':
        getCategories($bibleVerses);
        break;
    default:
        sendError('Acción no válida');
        break;
}

function getRandomVerse($verses, $category) {
    // Si la categoría no existe, usar 'general'
    if (!isset($verses[$category])) {
        $category = 'general';
    }
    
    $categoryVerses = $verses[$category];
    $randomVerse = $categoryVerses[array_rand($categoryVerses)];
    
    sendSuccess([
        'category' => $category,
        'verse' => $randomVerse['verse'],
        'text' => $randomVerse['text']
    ]);
}

function getRandomTitle($titles, $category) {
    // Si la categoría no existe, usar una mezcla
    if (!isset($titles[$category])) {
        $allTitles = [];
        foreach ($titles as $cat => $catTitles) {
            $allTitles = array_merge($allTitles, $catTitles);
        }
        $randomTitle = $allTitles[array_rand($allTitles)];
    } else {
        $categoryTitles = $titles[$category];
        $randomTitle = $categoryTitles[array_rand($categoryTitles)];
    }
    
    sendSuccess([
        'category' => $category,
        'title' => $randomTitle
    ]);
}

function getBothTitleAndVerse($verses, $titles, $category) {
    // Si la categoría no existe, usar 'general'
    if (!isset($verses[$category])) {
        $category = 'general';
    }
    
    // Obtener versículo aleatorio
    $categoryVerses = $verses[$category];
    $randomVerse = $categoryVerses[array_rand($categoryVerses)];
    
    // Obtener título aleatorio
    if (isset($titles[$category])) {
        $categoryTitles = $titles[$category];
        $randomTitle = $categoryTitles[array_rand($categoryTitles)];
    } else {
        $allTitles = [];
        foreach ($titles as $cat => $catTitles) {
            $allTitles = array_merge($allTitles, $catTitles);
        }
        $randomTitle = $allTitles[array_rand($allTitles)];
    }
    
    sendSuccess([
        'category' => $category,
        'title' => $randomTitle,
        'verse' => $randomVerse['verse'],
        'text' => $randomVerse['text']
    ]);
}

function getCategories($verses) {
    $categories = array_keys($verses);
    sendSuccess([
        'categories' => $categories,
        'total' => count($categories)
    ]);
}

function sendSuccess($data) {
    echo json_encode(array_merge(['success' => true], $data));
    exit;
}

function sendError($message) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => $message
    ]);
    exit;
}
?>