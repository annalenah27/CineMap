document.addEventListener("DOMContentLoaded", function() {
    // Wichtige DOM-Elemente abrufen
    const panel              = document.getElementById("info-panel");       // Info-Panel
    const button             = document.getElementById("toggle-panel");    // Button zum Ein-/Ausblenden des Panels
    const locationInfo       = document.getElementById("location-info");   // Informationen zur ausgewählten Location
    const filmList           = document.getElementById("film-list");       // Liste der Filme
    const countryList        = document.getElementById("country-list");    // Liste der Länder
    const themeList          = document.getElementById("theme-list");      // Liste der Themen
    const locationList       = document.getElementById("location-list");   // Liste der Drehorte
    const listsContainer     = document.getElementById("lists-container"); // Container für die Listen
    const searchField        = document.getElementById("search-field");    // Suchfeld für Eingaben
    const searchSuggestions  = document.getElementById("search-suggestions"); // Vorschläge während der Suche

    // Globale Variablen für Filter und Markierungen
    window.markers               = [];     // Array zur Speicherung aller Marker auf der Karte
    window.currentFilter         = "";     // Aktuell ausgewählter Filter
    window.currentFilm           = "";     // Aktuell ausgewählter Film
    window.currentCountry        = "";     // Aktuell ausgewähltes Land
    window.currentTheme          = "";     // Aktuell ausgewähltes Thema
    window.currentSelectedMarker = null;   // Aktuell ausgewählter Marker auf der Karte




    // Zwei Marker-Icons definieren (normales und ausgewähltes Icon)
    const normalIcon = L.icon({
        iconUrl: '/CineMap/src/assets/marker.png',         // Standard-Marker-Icon
        iconSize: [40, 50],            // Größe des Icons (Breite, Höhe)
        iconAnchor: [20, 50],          // Ankerpunkt (Position des Icons relativ zum Klickpunkt)
        popupAnchor: [0, -45]          // Position des Popups relativ zum Icon
    });

    const selectedIcon = L.icon({
        iconUrl: '/CineMap/src/assets/marker-selected.png', // Icon für einen ausgewählten Marker
        iconSize: [40, 50],             // Größe des Icons (Breite, Höhe)
        iconAnchor: [20, 50],           // Ankerpunkt (entspricht dem normalen Icon)
        popupAnchor: [0, -45]           // Position des Popups relativ zum Icon
    });




    // Funktion zum Öffnen/Schließen der Sidebar
    function togglePanel() {
        if (panel.classList.contains("info-visible")) {
            // Sidebar schließen
            panel.classList.remove("info-visible");
            setTimeout(() => {
                panel.style.visibility = "hidden";
                panel.style.opacity    = "0";

                // Standardtext in der Sidebar anzeigen
                locationInfo.style.display = "block";
                locationInfo.innerHTML = `
                    Entdecke Drehorte von Filmen und Serien auf unserer interaktiven Weltkarte.<br>
                    Klicke auf einen Marker, um mehr Details zu erfahren, oder wähle in der Navigation "Filme", "Länder" oder "Themen" aus.
                `;

                // Alle dynamischen Listen ausblenden und leeren
                listsContainer.style.display = "none";
                
                filmList.innerHTML         = "";
                filmList.style.display     = "none";

                countryList.innerHTML      = "";
                countryList.style.display  = "none";

                themeList.innerHTML        = "";
                themeList.style.display    = "none";

                locationList.innerHTML     = "";
                locationList.style.display = "none";
            }, 300); // Verzögerung für den Schließeffekt
            
            // Button-Icon zurücksetzen (Menü-Symbol)
            button.innerHTML = "☰"; 
        } else {
            // Sidebar öffnen
            panel.style.visibility = "visible";
            panel.style.opacity    = "1";
            panel.classList.add("info-visible");

            // Button-Icon ändern (Schließen-Symbol)
            button.innerHTML = "✖"; 
        }
    }

    // Event-Listener für den Button zum Öffnen/Schließen der Sidebar
    button.addEventListener("click", togglePanel);




    // Karte initialisieren (Leaflet)
    const map = L.map('map').setView([51.1657, 10.4515], 5); // Startansicht: Deutschland
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap contributors &copy; CARTO'
    }).addTo(map);

    // Weltweite Ansicht setzen
    map.setView([20, 0], 2.2);

    // Drehorte laden – get_locations.php liefert auch country_name und theme
    fetch('/CineMap/src/php/get_locations.php')
      .then(response => response.json())
      .then(data => {
          console.log("Empfangene Drehorte:", data);

          window.markers = []; // Array für alle Marker zurücksetzen

          // Alle Drehorte durchlaufen und Marker auf der Karte setzen
          data.forEach(loc => {
              const marker = L.marker(
                  [parseFloat(loc.latitude), parseFloat(loc.longitude)], // Koordinaten in Float umwandeln
                  { icon: normalIcon } // Standard-Marker setzen
              ).addTo(map);

              // Popup mit Basis-Informationen zum Drehort
              marker.bindPopup(`
                  <b>${loc.location_name}</b><br>
                  <i>${loc.movie_title} (${loc.year})</i><br>
                  ${loc.street_address ? loc.street_address + ", " : ""}${loc.city ? loc.city : ""}
              `);        

              // Beim Klick auf den Marker: Detailansicht anzeigen und Icon wechseln
              marker.on('click', function() {
                  showDetailedView(loc, marker);
              });

              // Marker-Daten speichern für spätere Nutzung
              window.markers.push({
                  name: loc.location_name,                  // Name des Drehorts
                  movie: loc.movie_title,                   // Filmtitel
                  year: loc.year,                           // Erscheinungsjahr des Films
                  street_address: loc.street_address,       // Adresse (falls vorhanden)
                  postal_code: loc.postal_code,             // Postleitzahl (falls vorhanden)
                  city: loc.city,                           // Stadt des Drehorts
                  real_description: loc.real_description,   // Beschreibung der echten Location
                  film_description: loc.film_description,   // Beschreibung im Filmkontext
                  image_url: loc.image_url,                 // Bild-URL des Drehorts
                  country: loc.country_name,                // Land des Drehorts
                  theme: loc.theme,                         // Filmgenre/Thema
                  marker: marker,                           // Referenz zum Marker-Objekt
                  latitude: parseFloat(loc.latitude),       // Breitenkoordinate
                  longitude: parseFloat(loc.longitude)      // Längenkoordinate
              });
          });

          console.log("Gespeicherte Marker:", window.markers);
      })
      .catch(error => console.error("Fehler beim Laden der Drehorte:", error));



      
      // Suchfunktion: Aktualisiert die Vorschlagsliste basierend auf der Nutzereingabe
      function updateSearchSuggestions(term) {
        // Vorschlagsliste zurücksetzen
        searchSuggestions.innerHTML = "";

        // Falls kein Suchbegriff eingegeben wurde, Vorschlagsliste ausblenden und beenden
        if (term.length === 0) {
            searchSuggestions.style.display = "none";
            return;
        }

        // Vorschlagsliste anzeigen
        searchSuggestions.style.display = "block";

        // Filtert Marker anhand des Suchbegriffs
        const suggestions = window.markers.filter(item => 
            item.name.toLowerCase().includes(term) ||                                   // Drehortname enthält den Suchbegriff
            item.movie.toLowerCase().includes(term) ||                                  // Filmname enthält den Suchbegriff
            (item.city && item.city.toLowerCase().includes(term)) ||                    // Stadt enthält den Suchbegriff
            (item.street_address && item.street_address.toLowerCase().includes(term))   // Straße enthält den Suchbegriff
        );

        // Generiere eine Liste mit passenden Ergebnissen
        suggestions.forEach(item => {
            const li = document.createElement("li");
            li.textContent = `${item.name} (${item.movie})`; // Format: Drehort (Film)

            // Klick-Event für einen Vorschlag
            li.addEventListener("click", () => {
                searchField.value = ""; // Suchfeld leeren
                map.setView([item.latitude, item.longitude], 16); // Karte auf den gewählten Ort zoomen
                showDetailedView(item, item.marker); // Detailansicht anzeigen
                
                // Vorschlagsliste zurücksetzen und ausblenden
                searchSuggestions.innerHTML = "";
                searchSuggestions.style.display = "none";
            });

            // Vorschlag zur Liste hinzufügen
            searchSuggestions.appendChild(li);
        });
    }




     // Suchfunktion: Filtert Marker basierend auf dem Suchbegriff
     function filterBySearch(searchTerm) {
        console.log("Suche nach:", searchTerm);

        // Alle Marker von der Karte entfernen
        window.markers.forEach(item => map.removeLayer(item.marker));

        // Marker filtern nach Namen, Film, Stadt oder Straße
        const filtered = window.markers.filter(item => 
            item.name.toLowerCase().includes(searchTerm) ||
            item.movie.toLowerCase().includes(searchTerm) ||
            (item.city && item.city.toLowerCase().includes(searchTerm)) ||
            (item.street_address && item.street_address.toLowerCase().includes(searchTerm))
        );

        // Gefilterte Marker wieder zur Karte hinzufügen
        filtered.forEach(item => item.marker.addTo(map));

        // Suchergebnisse im Info-Bereich anzeigen
        locationInfo.innerHTML = `<h3>Suchergebnisse für "${searchTerm}"</h3>`;
        locationInfo.style.display = "block";
        listsContainer.style.display = "block";

        // Andere Listen ausblenden
        filmList.style.display = "none";
        countryList.style.display = "none";
        themeList.style.display = "none";

        // Liste der gefundenen Drehorte anzeigen
        locationList.style.display = "block";
        locationList.innerHTML = "";

        // Falls keine Ergebnisse gefunden wurden, entsprechende Meldung anzeigen
        if (filtered.length === 0) {
            locationList.innerHTML = "<li>Keine Ergebnisse gefunden.</li>";
        } else {
            // Treffer zur Ergebnisliste hinzufügen
            filtered.forEach(item => {
                const li = document.createElement("li");
                li.textContent = `${item.name} (${item.movie})`;
                li.classList.add("location-item");

                // Klick-Event für Listeintrag: Karte auf den Ort zentrieren & Detailansicht öffnen
                li.addEventListener("click", () => {
                    map.setView([item.latitude, item.longitude], 16);
                    showDetailedView(item, item.marker);
                });

                locationList.appendChild(li);
            });
        }
    }

    // Event Listener für das Suchfeld (löst die Vorschlagsliste aus)
    searchField.addEventListener("input", function() {
        let term = searchField.value.trim().toLowerCase();
        updateSearchSuggestions(term);
    });

    // Globaler Klick-Listener: Blendet die Suchvorschläge aus, wenn außerhalb geklickt wird
    document.addEventListener("click", function(e) {
        if (!searchField.contains(e.target) && !searchSuggestions.contains(e.target)) {
            searchSuggestions.innerHTML = "";
            searchSuggestions.style.display = "none";
        }
    });




    // Event Listener für den "Filme"-Link
    document.querySelector('nav ul li a[href="#filme"]').addEventListener("click", function(event) {
        event.preventDefault();

        // Sidebar sichtbar machen
        panel.style.visibility = "visible";
        panel.style.opacity    = "1";
        panel.classList.add("info-visible");
        button.innerHTML = "✖";

        // Anzeigen der Filmliste, andere Listen ausblenden
        locationInfo.style.display = "none";
        listsContainer.style.display = "block";
        filmList.style.display  = "block";
        countryList.style.display = "none";
        themeList.style.display   = "none";
        locationList.style.display= "none";

        // Filme aus der Datenbank abrufen
        fetch('/CineMap/src/php/get_movies.php')
            .then(response => response.json())
            .then(movies => {
                console.log("Geladene Filme:", movies);
                filmList.innerHTML = "";

                // Filme zur Liste hinzufügen
                movies.forEach(movie => {
                    const li = document.createElement("li");
                    li.textContent = movie.title;
                    li.dataset.movieTitle = movie.title;
                    li.classList.add("film-item");

                    // Klick-Event für Filmfilter
                    li.addEventListener("click", function() {
                        filterByMovie(movie.title);
                    });

                    filmList.appendChild(li);
                });
            })
            .catch(error => console.error("Fehler beim Laden der Filme:", error));
    });




    // Event Listener für den "Länder"-Link
    document.querySelector('nav ul li a[href="#laender"]').addEventListener("click", function(event) {
        event.preventDefault();

        // Sidebar sichtbar machen
        panel.style.visibility = "visible";
        panel.style.opacity    = "1";
        panel.classList.add("info-visible");
        button.innerHTML = "✖";

        // Anzeigen der Länderliste, andere Listen ausblenden
        locationInfo.style.display = "none";
        listsContainer.style.display = "block";
        countryList.style.display = "block";
        filmList.style.display  = "none";
        themeList.style.display = "none";
        locationList.style.display= "none";

        // Länder aus der Datenbank abrufen
        fetch('/CineMap/src/php/get_countries.php')
            .then(response => response.json())
            .then(countries => {
                console.log("Geladene Länder:", countries);
                countryList.innerHTML = "";

                // Länder zur Liste hinzufügen
                countries.forEach(country => {
                    const li = document.createElement("li");
                    li.textContent = country.name;
                    li.dataset.countryName = country.name;
                    li.classList.add("country-item");

                    // Klick-Event für Länderfilter
                    li.addEventListener("click", function() {
                        filterByCountry(country.name);
                    });

                    countryList.appendChild(li);
                });
            })
            .catch(error => console.error("Fehler beim Laden der Länder:", error));
    });





    // Event Listener für den "Themen"-Link
    document.querySelector('nav ul li a[href="#themen"]').addEventListener("click", function(event) {
        event.preventDefault();
        console.log("Themen-Link wurde geklickt!");

        // Sidebar sichtbar machen
        panel.style.visibility = "visible";
        panel.style.opacity    = "1";
        panel.classList.add("info-visible");
        button.innerHTML = "✖";

        // Anzeigen der Themenliste, andere Listen ausblenden
        locationInfo.style.display = "none";
        listsContainer.style.display = "block";
        themeList.style.display = "block";
        filmList.style.display = "none";
        countryList.style.display = "none";
        locationList.style.display = "none";

        // Themen aus der Datenbank abrufen
        fetch('/CineMap/src/php/get_themes.php')
            .then(response => response.json())
            .then(themes => {
                console.log("Geladene Themen:", themes);
                themeList.innerHTML = "";

                // Themen zur Liste hinzufügen
                themes.forEach(theme => {
                    const li = document.createElement("li");
                    li.textContent = theme.name;
                    li.dataset.themeName = theme.name;
                    li.classList.add("theme-item");

                    // Klick-Event für Themenfilter
                    li.addEventListener("click", function() {
                        filterByTheme(theme.name);
                    });

                    themeList.appendChild(li);
                });
            })
            .catch(error => console.error("Fehler beim Laden der Themen:", error));
    });




     // Filterfunktion: Drehorte nach Film
     function filterByMovie(movieTitle) {
        console.log("Filtere Drehorte für:", movieTitle);

        // Alle Marker von der Karte entfernen
        window.markers.forEach(item => map.removeLayer(item.marker));

        // Marker filtern nach Filmtitel (ignoriere Groß-/Kleinschreibung und Leerzeichen)
        const filteredLocations = window.markers.filter(item =>
            item.movie.trim().toLowerCase() === movieTitle.trim().toLowerCase()
        );

        // Gefilterte Marker wieder zur Karte hinzufügen
        filteredLocations.forEach(item => item.marker.addTo(map));

        // Globale Filtervariable setzen
        window.currentFilter = "movie";
        window.currentFilm   = movieTitle;
        window.currentCountry= "";
        window.currentTheme  = "";

        // UI-Elemente anpassen
        filmList.style.display   = "none";
        themeList.style.display  = "none";
        countryList.style.display= "none";
        locationList.style.display = "block";
        locationInfo.style.display = "block";

        // Überschrift und Zurück-Button hinzufügen
        locationInfo.innerHTML = `
            <h3>${movieTitle}</h3>
            <p>Hier sind alle Drehorte dieses Films:</p>
            <button id="back-to-main" class="back-button">Zurück zur Filmliste</button>
        `;

        // Zurück zur Hauptliste wechseln
        document.getElementById("back-to-main").addEventListener("click", () => {
            showMainList("movie");
        });

        // Ergebnisliste aktualisieren
        locationList.innerHTML = "";
        filteredLocations.forEach(item => {
            const li = document.createElement("li");
            li.textContent = item.name;
            li.classList.add("location-item");

            // Klick-Event: Karte zentrieren und Detailansicht öffnen
            li.addEventListener("click", () => {
                map.setView([item.latitude, item.longitude], 16);
                showDetailedView(item, item.marker);
            });

            locationList.appendChild(li);
        });
    }




    // Filterfunktion: Drehorte nach Land
    function filterByCountry(countryName) {
        console.log("Filtere Drehorte für:", countryName);

        // Alle Marker von der Karte entfernen
        window.markers.forEach(item => map.removeLayer(item.marker));

        // Marker filtern nach Land (ignoriere Groß-/Kleinschreibung und Leerzeichen)
        const filteredLocations = window.markers.filter(item =>
            item.country && item.country.trim().toLowerCase() === countryName.trim().toLowerCase()
        );

        // Gefilterte Marker zur Karte hinzufügen
        filteredLocations.forEach(item => item.marker.addTo(map));

        // Globale Filtervariable setzen
        window.currentFilter = "country";
        window.currentCountry = countryName;
        window.currentFilm    = "";
        window.currentTheme   = "";

        // UI-Elemente anpassen
        countryList.style.display = "none";
        locationList.style.display = "block";
        locationInfo.style.display = "block";

        // Überschrift und Zurück-Button hinzufügen
        locationInfo.innerHTML = `
            <h3>${countryName}</h3>
            <p>Hier sind alle Drehorte in diesem Land:</p>
            <button id="back-to-main" class="back-button">Zurück zur Länderliste</button>
        `;

        // Zurück zur Hauptliste wechseln
        document.getElementById("back-to-main").addEventListener("click", () => {
            showMainList("country");
        });

        // Ergebnisliste aktualisieren
        locationList.innerHTML = "";
        filteredLocations.forEach(item => {
            const li = document.createElement("li");
            li.textContent = item.name;
            li.classList.add("location-item");

            // Klick-Event: Karte zentrieren und Detailansicht öffnen
            li.addEventListener("click", () => {
                map.setView([item.latitude, item.longitude], 16);
                showDetailedView(item, item.marker);
            });

            locationList.appendChild(li);
        });
    }





    // Filterfunktion: Drehorte nach Thema
    function filterByTheme(themeName) {
        console.log("Filtere Drehorte für das Thema:", themeName);

        // Alle Marker von der Karte entfernen
        window.markers.forEach(item => map.removeLayer(item.marker));

        // Marker filtern nach Thema (mehrere Themen können durch Komma getrennt sein)
        const filteredLocations = window.markers.filter(item => {
            if (!item.theme) return false;
            const themesArray = item.theme.toLowerCase().split(',').map(t => t.trim());
            console.log("Marker-Themen:", themesArray, "gesucht:", themeName.trim().toLowerCase());
            return themesArray.includes(themeName.trim().toLowerCase());
        });

        // Gefilterte Marker zur Karte hinzufügen
        filteredLocations.forEach(item => item.marker.addTo(map));

        // Globale Filtervariable setzen
        window.currentFilter = "theme";
        window.currentTheme   = themeName;
        window.currentFilm    = "";
        window.currentCountry = "";

        // UI-Elemente anpassen
        themeList.style.display = "none";
        locationList.style.display = "block";
        locationInfo.style.display = "block";

        // Überschrift und Zurück-Button hinzufügen
        locationInfo.innerHTML = `
            <h3>${themeName}</h3>
            <p>Hier sind alle Drehorte zu diesem Thema:</p>
            <button id="back-to-main-theme" class="back-button">Zurück zur Themenliste</button>
        `;

        // Zurück zur Hauptliste wechseln
        document.getElementById("back-to-main-theme").addEventListener("click", () => {
            showMainList("theme");
        });

        // Ergebnisliste aktualisieren
        locationList.innerHTML = "";

        // Falls keine Drehorte gefunden wurden, Meldung anzeigen
        if (filteredLocations.length === 0) {
            locationList.innerHTML = "<li>Keine Drehorte gefunden.</li>";
        } else {
            filteredLocations.forEach(item => {
                const li = document.createElement("li");
                li.textContent = item.name;
                li.classList.add("location-item");

                // Klick-Event: Karte zentrieren und Detailansicht öffnen
                li.addEventListener("click", () => {
                    map.setView([item.latitude, item.longitude], 16);
                    showDetailedView(item, item.marker);
                });

                locationList.appendChild(li);
            });
        }
    }




    // Anzeige der Detailansicht eines Drehorts mit Marker-Icon-Wechsel
    function showDetailedView(loc, marker) {
        // Falls bereits ein Marker ausgewählt ist, setze dessen Icon zurück
        if (window.currentSelectedMarker && window.currentSelectedMarker !== marker) {
            window.currentSelectedMarker.setIcon(normalIcon);
        }

        // Setze das Icon des neu ausgewählten Markers
        marker.setIcon(selectedIcon);
        window.currentSelectedMarker = marker;

        // UI-Elemente anpassen
        locationList.style.display = "none";
        panel.style.visibility = "visible";
        panel.style.opacity    = "1";
        panel.classList.add("info-visible");
        button.innerHTML = "✖";
        locationInfo.style.display = "block";

        // Fallbacks für fehlende Werte
        const displayName = loc.name || loc.location_name || "Unbekannt";
        const film = loc.movie || loc.movie_title || "Unbekannt";
        const address = [
            loc.street_address,
            loc.postal_code,
            loc.city
        ].filter(Boolean).join(", "); // Adresse nur mit vorhandenen Werten zusammensetzen

        // Detailinformationen in das Info-Panel einfügen
        locationInfo.innerHTML = `
            <h3>${displayName}</h3>
            <p><b>Film:</b> ${film} (${loc.year})</p>
            <p><b>Adresse:</b> ${address || "Keine Adresse verfügbar"}</p>
            <p><b>Beschreibung:</b> ${loc.real_description || "Keine Beschreibung verfügbar"}</p>
            <p><b>Film-Beschreibung:</b> ${loc.film_description || "Keine Beschreibung verfügbar"}</p>
            ${loc.image_url ? `<img src="${loc.image_url}" alt="Bild von ${displayName}" style="width:100%; border-radius:8px; margin-top:10px;">` : ""}
            <br>
            <button id="back-button" class="back-button">Zurück</button>
        `;

        // "Zurück"-Button Event-Listener
        document.getElementById("back-button").addEventListener("click", () => {
            // Setze das Icon des aktuellen Markers zurück
            marker.setIcon(normalIcon);
            window.currentSelectedMarker = null;

            // Rückkehr zur vorherigen Liste basierend auf aktivem Filter
            switch (window.currentFilter) {
                case "country":
                    filterByCountry(window.currentCountry);
                    break;
                case "movie":
                    filterByMovie(window.currentFilm);
                    break;
                case "theme":
                    filterByTheme(window.currentTheme);
                    break;
                default:
                    resetPins(); // Falls kein Filter aktiv ist, alle Pins zurücksetzen
            }
        });
    }

    // Zeige die jeweilige Hauptliste (Filme, Länder, Themen)
    function showMainList(filterType) {
        locationInfo.style.display = "none";
        listsContainer.style.display = "block";

        // Steuerung der Sichtbarkeit je nach ausgewähltem Filter
        filmList.style.display   = (filterType === "movie") ? "block" : "none";
        countryList.style.display = (filterType === "country") ? "block" : "none";
        themeList.style.display   = (filterType === "theme") ? "block" : "none";
        locationList.style.display = "none"; // Verstecke die Detailansicht
    }




    // Reset-Funktion: Alle Marker wiederherstellen und Ansicht zurücksetzen
    document.getElementById("reset-button").addEventListener("click", resetPins);

    function resetPins() {
        // Alle entfernten Marker wieder zur Karte hinzufügen
        window.markers.forEach(item => {
            if (!map.hasLayer(item.marker)) {
                item.marker.addTo(map);
            }
        });

        // Kartenansicht auf Standardposition zurücksetzen
        map.setView([20, 0], 2);

        // Alle globalen Filtervariablen zurücksetzen
        window.currentFilm    = "";
        window.currentCountry = "";
        window.currentTheme   = "";

        // Standardtext in der Sidebar anzeigen
        locationInfo.style.display = "block";
        locationInfo.innerHTML = `
            Entdecke Drehorte von Filmen und Serien auf unserer interaktiven Weltkarte.<br>
            Klicke auf einen Marker, um mehr Details zu erfahren, oder wähle in der Navigation "Filme", "Länder" oder "Themen" aus.
        `;

        // Listen und Sidebar ausblenden
        listsContainer.style.display = "none";
        filmList.style.display  = "none";
        themeList.style.display = "none";
        countryList.style.display = "none";
        locationList.style.display = "none";

        // Sidebar langsam ausblenden
        panel.classList.remove("info-visible");
        setTimeout(() => {
            panel.style.visibility = "hidden";
            panel.style.opacity    = "0";
        }, 300);

        // Menü-Button zurücksetzen
        button.innerHTML = "☰";
    }

    // Globaler Klick-Listener: Blendet die Suchvorschläge aus, wenn außerhalb geklickt wird
    document.addEventListener("click", function(e) {
        if (!searchField.contains(e.target) && !searchSuggestions.contains(e.target)) {
            searchSuggestions.innerHTML = "";
            searchSuggestions.style.display = "none";
        }
    });

});




















