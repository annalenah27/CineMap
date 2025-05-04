<?php
// Datenbank-Konfiguration
$server   = "localhost";
$user     = "root";
$passwort = ""; // Falls nötig, anpassen
$database = "anlehudb";

try {
    // Verbindung zu MySQL ohne Datenbank (weil wir sie erst erstellen müssen)
    $pdo = new PDO("mysql:host=$server", $user, $passwort);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Datenbank erstellen, falls sie nicht existiert
    $pdo->exec("CREATE DATABASE IF NOT EXISTS `$database` CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci");

    echo "✅ Datenbank '$database' wurde erfolgreich erstellt.<br>";
    echo "ℹ️ Bitte lade die Datei <strong>anlehudb.sql</strong> manuell in phpMyAdmin hoch.<br>";
    echo "1. Öffne <a href='http://localhost/phpmyadmin/' target='_blank'>phpMyAdmin</a>.<br>";
    echo "2. Wähle die Datenbank <strong>'$database'</strong> aus.<br>";
    echo "3. Gehe zu 'Importieren' und lade die Datei <strong>anlehudb.sql</strong> hoch.<br>";
    echo "🎉 Fertig! Danach kannst du die Anwendung nutzen.";

} catch (PDOException $e) {
    die("❌ Fehler: " . $e->getMessage());
}
?>


