<?php
// Fehler nur in der Entwicklung anzeigen
$development = true;
if ($development) {
    ini_set('display_errors', 1);
    error_reporting(E_ALL);
} else {
    ini_set('display_errors', 0);
    error_reporting(0);
}

// JSON-Header setzen
header("Access-Control-Allow-Origin: *");
header('Content-Type: application/json');

// Datenbankverbindung
$dsn = "mysql:host=localhost;dbname=anlehudb;charset=utf8mb4";
$username = "root";
$password = "";

try {
    $pdo = new PDO($dsn, $username, $password, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);

    // SQL-Abfrage
    $stmt = $pdo->query("SELECT id, name FROM themes ORDER BY name");
    $themes = $stmt->fetchAll();

    // Falls keine Themen existieren
    if (!$themes) {
        $themes = ["message" => "Keine Themen gefunden"];
    }

    echo json_encode($themes, JSON_UNESCAPED_UNICODE);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Datenbankfehler: " . $e->getMessage()]);
}
?>



