<?php
header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *");

$dsn = "mysql:host=localhost;dbname=anlehudb;charset=utf8";
$username = "root";
$password = "";

try {
    $pdo = new PDO($dsn, $username, $password, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);

    // Länder abrufen
    $stmt = $pdo->query("SELECT id, name, iso_code FROM countries ORDER BY name");
    $countries = $stmt->fetchAll();

    echo json_encode($countries, JSON_UNESCAPED_UNICODE);
} catch (PDOException $e) {
    echo json_encode(["error" => "Datenbankfehler: " . $e->getMessage()]);
}
?>