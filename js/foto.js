const auftragID =
    localStorage.getItem("RFE_AKTUELLER_AUFTRAG");

const fotoIndexText =
    localStorage.getItem("RFE_FOTO_INDEX");

const fotoIndex =
    fotoIndexText === null
        ? null
        : Number(fotoIndexText);

let auftrag = getAuftrag(auftragID);

if (!auftrag) {
    alert("Auftrag nicht gefunden.");
    location.href = "archiv.html";
    throw new Error("Auftrag nicht gefunden.");
}

if (!Array.isArray(auftrag.fotos)) {
    auftrag.fotos = [];
}

const kamera =
    document.getElementById("kamera");

const mediathek =
    document.getElementById("mediathek");

const vorschau =
    document.getElementById("vorschau");

const status =
    document.getElementById("status");

const speichernButton =
    document.getElementById("speichernButton");

let bildDaten = null;


/*
 * Vorhandenes Foto beim Öffnen anzeigen.
 */
if (
    fotoIndex !== null &&
    auftrag.fotos[fotoIndex]
) {
    const vorhandenesFoto =
        auftrag.fotos[fotoIndex];

    bildDaten =
        vorhandenesFoto.bild ||
        vorhandenesFoto;

    document.getElementById("titel").innerText =
        "Foto anzeigen";

    vorschau.src = bildDaten;
    vorschau.style.display = "block";

    speichernButton.disabled = false;
}


/*
 * Beide Auswahlfelder verwenden dieselbe Verarbeitung.
 */
kamera.addEventListener("change", dateiAusgewaehlt);
mediathek.addEventListener("change", dateiAusgewaehlt);


async function dateiAusgewaehlt(event) {

    const datei = event.target.files[0];

    if (!datei) {
        return;
    }

    if (!datei.type.startsWith("image/")) {
        alert("Bitte eine Bilddatei auswählen.");
        event.target.value = "";
        return;
    }

    status.innerText =
        "Bild wird vorbereitet …";

    speichernButton.disabled = true;

    try {

        bildDaten = await bildKomprimieren(
            datei,
            1600,
            0.72
        );

        vorschau.src = bildDaten;
        vorschau.style.display = "block";

        status.innerText =
            "Bild ist bereit zum Speichern.";

        speichernButton.disabled = false;

        /*
         * Verhindert, dass beide Eingabefelder
         * gleichzeitig eine alte Auswahl enthalten.
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

        status.innerText = "";

        alert(
            "Das Bild konnte nicht verarbeitet werden."
        );
    }
}


/*
 * Verkleinert ein Bild auf maximal 1600 Pixel
 * und speichert es als komprimiertes JPEG.
 */
function bildKomprimieren(
    datei,
    maximaleKantenlaenge,
    qualitaet
) {
    return new Promise(function(resolve, reject) {

        const reader = new FileReader();

        reader.onerror = function() {
            reject(
                new Error("Datei konnte nicht gelesen werden.")
            );
        };

        reader.onload = function() {

            const bild = new Image();

            bild.onerror = function() {
                reject(
                    new Error("Bild konnte nicht geladen werden.")
                );
            };

            bild.onload = function() {

                let breite = bild.naturalWidth;
                let hoehe = bild.naturalHeight;

                if (
                    breite > maximaleKantenlaenge ||
                    hoehe > maximaleKantenlaenge
                ) {
                    const faktor = Math.min(
                        maximaleKantenlaenge / breite,
                        maximaleKantenlaenge / hoehe
                    );

                    breite = Math.round(
                        breite * faktor
                    );

                    hoehe = Math.round(
                        hoehe * faktor
                    );
                }

                const canvas =
                    document.createElement("canvas");

                canvas.width = breite;
                canvas.height = hoehe;

                const context =
                    canvas.getContext("2d");

                /*
                 * Weißer Hintergrund verhindert
                 * schwarze Flächen bei transparenten Bildern.
                 */
                context.fillStyle = "#ffffff";

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

                resolve(komprimiert);
            };

            bild.src = reader.result;
        };

        reader.readAsDataURL(datei);
    });
}


function speichern() {

    if (!bildDaten) {
        alert(
            "Bitte zuerst ein Foto aufnehmen oder auswählen."
        );
        return;
    }

    const jetzt = new Date();

    /*
     * Beim Bearbeiten bleiben Datum und Uhrzeit
     * des vorhandenen Fotos erhalten.
     */
    let eintrag = {
        bild: bildDaten,
        datum: jetzt.toLocaleDateString("de-DE"),
        uhrzeit: jetzt.toLocaleTimeString(
            "de-DE",
            {
                hour: "2-digit",
                minute: "2-digit"
            }
        )
    };

    if (
        fotoIndex !== null &&
        auftrag.fotos[fotoIndex]
    ) {
        const alt = auftrag.fotos[fotoIndex];

        eintrag.datum =
            alt.datum || eintrag.datum;

        eintrag.uhrzeit =
            alt.uhrzeit || eintrag.uhrzeit;

        auftrag.fotos[fotoIndex] = eintrag;

    } else {

        auftrag.fotos.push(eintrag);
    }

    try {

        updateAuftrag(auftragID, auftrag);

        localStorage.removeItem(
            "RFE_FOTO_INDEX"
        );

        location.href = "fotos.html";

    } catch (fehler) {

        console.error(
            "Foto konnte nicht gespeichert werden:",
            fehler
        );

        if (
            fehler.name === "QuotaExceededError" ||
            fehler.code === 22
        ) {
            alert(
                "Der lokale Speicher ist voll. " +
                "Bitte zunächst ein Backup erstellen " +
                "und nicht benötigte oder alte Fotos löschen."
            );
        } else {
            alert(
                "Das Foto konnte nicht gespeichert werden."
            );
        }
    }
}


function zurueck() {

    localStorage.removeItem(
        "RFE_FOTO_INDEX"
    );

    location.href = "fotos.html";
}