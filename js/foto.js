/* =========================================================
   RFE BaustellenApp
   Foto aufnehmen, auswählen und in IndexedDB speichern
   ========================================================= */

const auftragID =
    localStorage.getItem("RFE_AKTUELLER_AUFTRAG");

const fotoID =
    localStorage.getItem("RFE_FOTO_ID");

let auftrag = getAuftrag(auftragID);

if (!auftrag) {
    alert("Auftrag nicht gefunden.");
    location.href = "archiv.html";
    throw new Error("Auftrag nicht gefunden.");
}


/* =========================================================
   Elemente der Seite
   ========================================================= */

const kamera =
    document.getElementById("kamera");

const mediathek =
    document.getElementById("mediathek");

const vorschau =
    document.getElementById("vorschau");

const statusElement =
    document.getElementById("status");

const speichernButton =
    document.getElementById("speichernButton");

const titelElement =
    document.getElementById("titel");


let bildDaten = null;
let vorhandenesFoto = null;


/* =========================================================
   Seite initialisieren
   ========================================================= */

initialisieren();


async function initialisieren() {

    /*
     * Wird ein bestehendes Foto geöffnet,
     * laden wir es anhand seiner eindeutigen ID.
     */
    if (fotoID) {

        try {

            vorhandenesFoto =
                await fotoDBLaden(fotoID);

            if (!vorhandenesFoto) {

                alert("Foto nicht gefunden.");

                localStorage.removeItem(
                    "RFE_FOTO_ID"
                );

                location.href = "fotos.html";

                return;
            }

            bildDaten =
                vorhandenesFoto.bild;

            titelElement.innerText =
                "Foto anzeigen";

            vorschau.src =
                bildDaten;

            vorschau.style.display =
                "block";

            statusElement.innerText =
                "Gespeichertes Foto";

            speichernButton.disabled =
                false;

        } catch (fehler) {

            console.error(
                "Foto konnte nicht geladen werden:",
                fehler
            );

            alert(
                "Das Foto konnte nicht geladen werden."
            );
        }
    }
}


/* =========================================================
   Kamera und Mediathek
   ========================================================= */

kamera.addEventListener(
    "change",
    dateiAusgewaehlt
);

mediathek.addEventListener(
    "change",
    dateiAusgewaehlt
);


async function dateiAusgewaehlt(event) {

    const datei =
        event.target.files[0];

    if (!datei) {
        return;
    }

    if (
        !datei.type ||
        !datei.type.startsWith("image/")
    ) {

        alert(
            "Bitte eine Bilddatei auswählen."
        );

        event.target.value = "";

        return;
    }

    statusElement.innerText =
        "Bild wird vorbereitet …";

    speichernButton.disabled =
        true;

    try {

        /*
         * Das Foto wird vor dem Speichern verkleinert.
         * Das spart Speicherplatz und beschleunigt das PDF.
         */
        bildDaten =
            await bildKomprimieren(
                datei,
                1800,
                0.78
            );

        vorschau.src =
            bildDaten;

        vorschau.style.display =
            "block";

        statusElement.innerText =
            "Bild ist bereit zum Speichern.";

        speichernButton.disabled =
            false;

        /*
         * Nur eines der beiden Dateifelder
         * soll eine Auswahl enthalten.
         */
        if (event.target === kamera) {

            mediathek.value = "";

        } else {

            kamera.value = "";
        }

    } catch (fehler) {

        console.error(
            "Bild konnte nicht verarbeitet werden:",
            fehler
        );

        statusElement.innerText = "";

        speichernButton.disabled =
            true;

        alert(
            "Das Bild konnte nicht verarbeitet werden."
        );
    }
}


/* =========================================================
   Bild verkleinern und komprimieren
   ========================================================= */

function bildKomprimieren(
    datei,
    maximaleKantenlaenge,
    qualitaet
) {

    return new Promise(
        function(resolve, reject) {

            const reader =
                new FileReader();

            reader.onerror =
                function() {

                    reject(
                        new Error(
                            "Die Bilddatei konnte nicht gelesen werden."
                        )
                    );
                };

            reader.onload =
                function() {

                    const bild =
                        new Image();

                    bild.onerror =
                        function() {

                            reject(
                                new Error(
                                    "Das Bild konnte nicht geladen werden."
                                )
                            );
                        };

                    bild.onload =
                        function() {

                            let breite =
                                bild.naturalWidth;

                            let hoehe =
                                bild.naturalHeight;

                            /*
                             * Seitenverhältnis beibehalten.
                             */
                            if (
                                breite >
                                maximaleKantenlaenge ||
                                hoehe >
                                maximaleKantenlaenge
                            ) {

                                const faktor =
                                    Math.min(
                                        maximaleKantenlaenge /
                                        breite,

                                        maximaleKantenlaenge /
                                        hoehe
                                    );

                                breite =
                                    Math.round(
                                        breite *
                                        faktor
                                    );

                                hoehe =
                                    Math.round(
                                        hoehe *
                                        faktor
                                    );
                            }

                            const canvas =
                                document.createElement(
                                    "canvas"
                                );

                            canvas.width =
                                breite;

                            canvas.height =
                                hoehe;

                            const context =
                                canvas.getContext(
                                    "2d"
                                );

                            if (!context) {

                                reject(
                                    new Error(
                                        "Bildverarbeitung ist nicht verfügbar."
                                    )
                                );

                                return;
                            }

                            /*
                             * Weißer Hintergrund verhindert
                             * schwarze Flächen bei Transparenz.
                             */
                            context.fillStyle =
                                "#ffffff";

                            context.fillRect(
                                0,
                                0,
                                breite,
                                hoehe
                            );

                            context.drawImage(
                                bild,
                                0,
                                0,
                                breite,
                                hoehe
                            );

                            const komprimiert =
                                canvas.toDataURL(
                                    "image/jpeg",
                                    qualitaet
                                );

                            resolve(
                                komprimiert
                            );
                        };

                    bild.src =
                        reader.result;
                };

            reader.readAsDataURL(
                datei
            );
        }
    );
}


/* =========================================================
   Foto speichern
   ========================================================= */

async function speichern() {

    if (!bildDaten) {

        alert(
            "Bitte zuerst ein Foto aufnehmen oder auswählen."
        );

        return;
    }

    speichernButton.disabled =
        true;

    statusElement.innerText =
        "Foto wird gespeichert …";

    const jetzt =
        new Date();

    const eintrag = {

        /*
         * Beim Bearbeiten wird dieselbe ID verwendet.
         * Bei einem neuen Foto erzeugt fotoDBSpeichern()
         * automatisch eine neue ID.
         */
        id:
            vorhandenesFoto
                ? vorhandenesFoto.id
                : undefined,

        auftragID:
            String(auftragID),

        bild:
            bildDaten,

        datum:
            vorhandenesFoto &&
            vorhandenesFoto.datum
                ? vorhandenesFoto.datum
                : jetzt.toLocaleDateString(
                    "de-DE"
                ),

        uhrzeit:
            vorhandenesFoto &&
            vorhandenesFoto.uhrzeit
                ? vorhandenesFoto.uhrzeit
                : jetzt.toLocaleTimeString(
                    "de-DE",
                    {
                        hour: "2-digit",
                        minute: "2-digit"
                    }
                ),

        beschreibung:
            vorhandenesFoto
                ? vorhandenesFoto.beschreibung || ""
                : "",

        erstelltAm:
            vorhandenesFoto &&
            vorhandenesFoto.erstelltAm
                ? vorhandenesFoto.erstelltAm
                : jetzt.toISOString()
    };

    try {

        await fotoDBSpeichern(
            eintrag
        );

        localStorage.removeItem(
            "RFE_FOTO_ID"
        );

        /*
         * Alte Index-Auswahl aus der bisherigen
         * localStorage-Version ebenfalls entfernen.
         */
        localStorage.removeItem(
            "RFE_FOTO_INDEX"
        );

        location.href =
            "fotos.html";

    } catch (fehler) {

        console.error(
            "Foto konnte nicht gespeichert werden:",
            fehler
        );

        statusElement.innerText =
            "";

        speichernButton.disabled =
            false;

        alert(
            "Das Foto konnte nicht gespeichert werden."
        );
    }
}


/* =========================================================
   Zurück zur Fotoliste
   ========================================================= */

function zurueck() {

    localStorage.removeItem(
        "RFE_FOTO_ID"
    );

    localStorage.removeItem(
        "RFE_FOTO_INDEX"
    );

    location.href =
        "fotos.html";
}