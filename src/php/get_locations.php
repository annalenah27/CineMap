<?php
header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *");

// Fehler nur in Entwicklung anzeigen
$development = true;
if ($development) {
    error_reporting(E_ALL);
    ini_set('display_errors', 1);
} else {
    error_reporting(0);
    ini_set('display_errors', 0);
}

// Datenbankverbindung mit PDO
$dsn = "mysql:host=localhost;dbname=anlehudb;charset=utf8mb4";
$username = "root";
$password = "";

try {
    $pdo = new PDO($dsn, $username, $password, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Datenbankverbindung fehlgeschlagen."]);
    exit;
}

// Prüfen, ob ein Film-Filter gesetzt ist
$movie = isset($_GET['movie']) ? trim($_GET['movie']) : '';

if (!empty($movie)) {
    // Prepared Statement für sichere Abfrage mit Filter
    $stmt = $pdo->prepare("
        SELECT 
            l.id, 
            l.location_name, 
            l.real_description, 
            l.film_description, 
            l.street_address, 
            l.postal_code, 
            l.city, 
            l.image_url, 
            l.latitude, 
            l.longitude, 
            m.title AS movie_title, 
            m.year,
            m.genre,
            c.name AS country_name,
            GROUP_CONCAT(t.name SEPARATOR ', ') AS theme
        FROM locations l
        JOIN movies m ON l.movie_id = m.id
        JOIN countries c ON l.country_id = c.id
        LEFT JOIN movie_themes mt ON m.id = mt.movie_id
        LEFT JOIN themes t ON mt.theme_id = t.id
        WHERE m.title = :movie
        GROUP BY l.id
        ORDER BY l.location_name
    ");
    $stmt->execute(['movie' => $movie]);
} else {
    // Abfrage ohne Filter
    $stmt = $pdo->query("
        SELECT 
            l.id, 
            l.location_name, 
            l.real_description, 
            l.film_description, 
            l.street_address, 
            l.postal_code, 
            l.city, 
            l.image_url, 
            l.latitude, 
            l.longitude, 
            m.title AS movie_title, 
            m.year,
            m.genre,
            c.name AS country_name,
            GROUP_CONCAT(t.name SEPARATOR ', ') AS theme
        FROM locations l
        JOIN movies m ON l.movie_id = m.id
        JOIN countries c ON l.country_id = c.id
        LEFT JOIN movie_themes mt ON m.id = mt.movie_id
        LEFT JOIN themes t ON mt.theme_id = t.id
        GROUP BY l.id
        ORDER BY m.title, l.location_name
    ");
}

// Daten abrufen
$locations = $stmt->fetchAll();

// Falls keine Drehorte gefunden wurden
if (!$locations) {
    $locations = ["message" => "Keine Drehorte gefunden"];
}

echo json_encode($locations, JSON_UNESCAPED_UNICODE);
?>

