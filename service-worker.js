const CACHE_NAME = "rfe-baustellenapp-v1.0.7";

const APP_DATEIEN = [
    "",
    "index.html",
    "manifest.json",

    "css/style.css",

    "assets/logo.png",
    "assets/icon-192.png",
    "assets/icon-512.png",

    "js/app.js",
    "js/config.js",
    "js/database.js",
    "js/backup.js",
    "js/foto.js",
    "js/fotos.js",
    "js/foto-database.js",
    "js/material.js",
    "js/material_position.js",
    "js/pdf.js",
    "js/regiebericht.js",
    "js/regieberichte.js",
    "js/taetigkeitsnachweis.js",
    "js/taetigkeitsnachweise.js",

    "pages/archiv.html",
    "pages/auftrag.html",
    "pages/auftrag_detail.html",
    "pages/backup.html",
    "pages/foto.html",
    "pages/fotos.html",
    "pages/material.html",
    "pages/material_position.html",
    "pages/pdf.html",
    "pages/regiebericht.html",
    "pages/regieberichte.html",
    "pages/taetigkeitsnachweis.html",
    "pages/taetigkeitsnachweise.html",
    "pages/unterschrift.html"
];


/* Jede Datei einzeln speichern.
   Eine fehlende Datei verhindert nicht mehr
   die komplette Installation. */
self.addEventListener("install", function(event) {

    event.waitUntil(

        caches.open(CACHE_NAME)
            .then(async function(cache) {

                for (const pfad of APP_DATEIEN) {

                    const url = new URL(
                        pfad,
                        self.registration.scope
                    ).href;

                    try {

                        const antwort = await fetch(
                            url,
                            {
                                cache: "reload"
                            }
                        );

                        if (!antwort.ok) {

                            console.warn(
                                "Nicht zwischengespeichert:",
                                url,
                                antwort.status
                            );

                            continue;
                        }

                        await cache.put(
                            url,
                            antwort
                        );

                    } catch (fehler) {

                        console.warn(
                            "Fehler beim Speichern:",
                            url,
                            fehler
                        );
                    }
                }

            })
            .then(function() {

                return self.skipWaiting();

            })
    );
});


/* Alte Cache-Versionen löschen */
self.addEventListener("activate", function(event) {

    event.waitUntil(

        caches.keys()
            .then(function(cacheNamen) {

                return Promise.all(

                    cacheNamen.map(
                        function(cacheName) {

                            if (
                                cacheName !==
                                CACHE_NAME
                            ) {

                                return caches.delete(
                                    cacheName
                                );
                            }
                        }
                    )
                );
            })
            .then(function() {

                return self.clients.claim();

            })
    );
});


/* Online möglichst aktuelle Datei verwenden.
   Offline auf gespeicherte Datei zurückgreifen. */
self.addEventListener("fetch", function(event) {

    if (event.request.method !== "GET") {
        return;
    }

    event.respondWith(

        fetch(event.request)
            .then(function(antwort) {

                if (
                    antwort &&
                    antwort.ok &&
                    antwort.type === "basic"
                ) {

                    const kopie =
                        antwort.clone();

                    caches.open(CACHE_NAME)
                        .then(function(cache) {

                            cache.put(
                                event.request,
                                kopie
                            );

                        });
                }

                return antwort;

            })
            .catch(async function() {

                const gespeichert =
                    await caches.match(
                        event.request,
                        {
                            ignoreSearch: true
                        }
                    );

                if (gespeichert) {
                    return gespeichert;
                }

                if (
                    event.request.mode ===
                    "navigate"
                ) {

                    const startseite =
                        new URL(
                            "index.html",
                            self.registration.scope
                        ).href;

                    return caches.match(
                        startseite
                    );
                }

                return new Response(
                    "Diese Datei ist offline nicht verfügbar.",
                    {
                        status: 503,
                        statusText: "Offline"
                    }
                );

            })
    );
});