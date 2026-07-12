const CACHE_NAME = "rfe-baustellenapp-v1.0.2";

const APP_DATEIEN = [
    "./",
    "./index.html",
    "./manifest.json",

    "./css/style.css",

    "./assets/logo.png",
    "./assets/icon-192.png",
    "./assets/icon-512.png",

    "./js/app.js",
    "./js/config.js",
    "./js/database.js",
    "./js/backup.js",
    "./js/foto.js",
    "./js/fotos.js",
    "./js/material.js",
    "./js/material_position.js",
    "./js/pdf.js",
    "./js/regiebericht.js",
    "./js/regieberichte.js",
    "./js/taetigkeitsnachweis.js",
    "./js/taetigkeitsnachweise.js",
    "./js/vendor/jspdf.umd.min.js",

    "./pages/archiv.html",
    "./pages/auftrag.html",
    "./pages/auftrag_detail.html",
    "./pages/backup.html",
    "./pages/foto.html",
    "./pages/fotos.html",
    "./pages/material.html",
    "./pages/material_position.html",
    "./pages/pdf.html",
    "./pages/regiebericht.html",
    "./pages/regieberichte.html",
    "./pages/taetigkeitsnachweis.html",
    "./pages/taetigkeitsnachweise.html",
    "./pages/unterschrift.html"
];


/* App installieren und Dateien speichern */
self.addEventListener("install", function(event) {

    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(function(cache) {
                return cache.addAll(APP_DATEIEN);
            })
            .then(function() {
                return self.skipWaiting();
            })
    );

});


/* Alte Cache-Versionen vollständig löschen */
self.addEventListener("activate", function(event) {

    event.waitUntil(
        caches.keys()
            .then(function(cacheNamen) {

                return Promise.all(
                    cacheNamen.map(function(cacheName) {

                        if (cacheName !== CACHE_NAME) {
                            return caches.delete(cacheName);
                        }

                    })
                );

            })
            .then(function() {
                return self.clients.claim();
            })
    );

});


/* Dateien abrufen */
self.addEventListener("fetch", function(event) {

    if (event.request.method !== "GET") {
        return;
    }

    const anfrage = event.request;

    /*
       HTML-Seiten und Navigation:
       zuerst die aktuelle Online-Version laden.
       Falls offline, Cache verwenden.
    */
    if (
        anfrage.mode === "navigate" ||
        anfrage.destination === "document"
    ) {

        event.respondWith(

            fetch(anfrage)
                .then(function(antwort) {

                    const kopie = antwort.clone();

                    caches.open(CACHE_NAME)
                        .then(function(cache) {
                            cache.put(anfrage, kopie);
                        });

                    return antwort;

                })
                .catch(function() {

                    return caches.match(anfrage)
                        .then(function(gespeichert) {

                            if (gespeichert) {
                                return gespeichert;
                            }

                            return caches.match("./index.html");

                        });

                })
        );

        return;
    }


    /*
       CSS, JavaScript, Bilder:
       zuerst Netzwerk, danach Cache.
       Dadurch werden Änderungen sofort übernommen.
    */
    event.respondWith(

        fetch(anfrage)
            .then(function(antwort) {

                if (
                    antwort &&
                    antwort.status === 200
                ) {

                    const kopie = antwort.clone();

                    caches.open(CACHE_NAME)
                        .then(function(cache) {
                            cache.put(anfrage, kopie);
                        });
                }

                return antwort;

            })
            .catch(function() {

                return caches.match(anfrage)
                    .then(function(gespeichert) {

                        if (gespeichert) {
                            return gespeichert;
                        }

                        return new Response(
                            "Diese Datei ist offline nicht verfügbar.",
                            {
                                status: 503,
                                statusText: "Offline"
                            }
                        );

                    });

            })
    );

});