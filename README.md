🎬 CineMap – Interaktive Film-Drehort-Karte

📌 Projektbeschreibung

CineMap ist eine interaktive Weltkarte, auf der Nutzer echte Drehorte berühmter Filme entdecken können. Durch Klicken auf die Marker auf der Karte können Nutzer detaillierte Informationen zu den Locations, Filmen und Hintergrundgeschichten erhalten.



🚀 Funktionen

- Anzeige von Drehorten auf einer Weltkarte mit Leaflet.js
- Filterung nach Filmen, Ländern und Themen
- Suchfunktion für schnelle Standortsuche
- Detailansicht mit Hintergrundinfos und Bildern
- Daten aus einer Datenbank abrufen (PHP + MySQL)


📂 Projektstruktur

📂 CineMap/
 ├──index.html      # Startseite
 │ 
 ├── 📂 src/ 
 ├────├──script.js
 ├────├──styles.css           
 │    ├── 📂 assets/      # Icons, Marker
 │    ├── 📂 php/         # PHP-Dateien (Backend)
 │
 ├── 📂 docs/             # Eigenständigkeitserklärung
 ├── README.md            # Diese Datei (Projektbeschreibung)



🛠 Installation & Setup

1️⃣ Lokal ausführen (z. B. mit XAMPP)


1. Verschiebe den Ordner CineMap/ in das htdocs-Verzeichnis von XAMPP (C:/xampp/htdocs/CineMap).
2. Starte XAMPP und aktiviere Apache und MySQL.
3. Führe das Setup-Skript aus, um die leere Datenbank zu erstellen:
4. Im Browser: http://localhost/CineMap/src/php/setup_database.php

✅ Datenbank anlehudb wurde erfolgreich erstellt.

5. Bitte lade die Datei anlehudb.sql manuell in phpMyAdmin hoch.

6. Öffne phpMyAdmin

7. Wähle die Datenbank 'anlehudb' aus

8. Gehe zu 'Importieren' und lade die Datei anlehudb.sql hoch

🎉 Fertig! Danach kannst du die Anwendung nutzen.

9. Öffne http://localhost/CineMap/ im Browser.


🖥️ Technologien

1. Frontend: HTML, CSS, JavaScript, Leaflet.js
2. Backend: PHP, MySQL
3. API: OpenStreetMap / CartoDB TileLayer für Kartenanzeige


🔄 Datenbankstruktur

Die Datenbank cinemap enthält folgende Tabellen:

1. locations – Speichert die Drehorte (Name, Koordinaten, Stadt, Film, Jahr)
2. movies – Enthält alle Filme (Titel, Genre, Jahr)
3. countries – Liste der Länder mit Film-Drehorten
4. themes – Kategorien wie "Oscar Preisträger", "Drama" etc.
5. movie_themes - 1:1 Beziehung von Film und Thema

🔗 Externe Bibliotheken:

1. Leaflet.js für Kartenanzeige
2. OpenStreetMap für Kartendaten
3. CartoDB Tiles für Kartenstile


📧 Kontakt

Falls Fragen aufkommen, bin ich unter a.huebl18269@hs-ansbach.de erreichbar. 😊



