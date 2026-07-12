console.log("RFE BaustellenApp gestartet");

if ("serviceWorker" in navigator) {

    window.addEventListener("load", function() {

        navigator.serviceWorker
            .register("./service-worker.js")
            .then(function(registrierung) {

                console.log(
                    "Service Worker registriert:",
                    registrierung.scope
                );

            })
            .catch(function(fehler) {

                console.error(
                    "Service Worker konnte nicht registriert werden:",
                    fehler
                );

            });

    });

}