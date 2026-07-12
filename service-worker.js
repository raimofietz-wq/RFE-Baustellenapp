const CACHE_NAME = "rfe-baustellenapp-v1";

const START_DATEIEN = [
    "./",
    "./index.html",
    "./css/style.css",
    "./js/config.js",
    "./js/database.js",
    "./js/app.js",
    "./assets/logo.png"
];

self.addEventListener("install", function(event) {

    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(function(cache) {
                return cache.addAll(START_DATEIEN);
            })
    );

    self.skipWaiting();
});


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
    );

    self.clients.claim();
});


self.addEventListener("fetch", function(event) {

    if (event.request.method !== "GET") {
        return;
    }

    event.respondWith(

        fetch(event.request)
            .then(function(antwort) {

                const kopie = antwort.clone();

                caches.open(CACHE_NAME)
                    .then(function(cache) {
                        cache.put(event.request, kopie);
                    });

                return antwort;

            })
            .catch(function() {

                return caches.match(event.request)
                    .then(function(gespeichert) {

                        if (gespeichert) {
                            return gespeichert;
                        }

                        if (event.request.mode === "navigate") {
                            return caches.match("./index.html");
                        }

                        return new Response(
                            "Diese Seite ist offline noch nicht gespeichert.",
                            {
                                status: 503,
                                statusText: "Offline"
                            }
                        );

                    });

            })
    );

});