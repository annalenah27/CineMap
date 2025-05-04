<?php
header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *");

// Fehler nur in der Entwicklung anzeigen
$development = true; // In Produktion auf "false" setzen
if ($development) {
    error_reporting(E_ALL);
    ini_set('display_errors', 1);
} else {
    error_reporting(0);
    ini_set('display_errors', 0);
}

try {
    // PDO-Datenbankverbindung herstellen
    $pdo = new PDO("mysql:host=localhost;dbname=anlehudb;charset=utf8mb4", "root", "", [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Datenbankverbindung fehlgeschlagen."]);
    exit;
}

// SQL-Abfrage: Alle Filme holen, nach Titel sortiert
$sql = "SELECT id, title, year, genre FROM movies ORDER BY title";
$stmt = $pdo->query($sql);
$movies = $stmt->fetchAll();

// Falls keine Filme gefunden wurden
if (!$movies) {
    $movies = ["message" => "Keine Filme gefunden"];
}

echo json_encode($movies, JSON_UNESCAPED_UNICODE);
?>
