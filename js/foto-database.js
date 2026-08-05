/* =========================================================
   RFE BaustellenApp
   IndexedDB-Speicherung für Fotos
   ========================================================= */

const FOTO_DB_NAME = "RFE_BAUSTELLENAPP_DB";
const FOTO_DB_VERSION = 1;
const FOTO_STORE_NAME = "fotos";


/*
 * Datenbank öffnen.
 * Der Fotospeicher wird beim ersten Start automatisch erstellt.
 */
function fotoDatenbankOeffnen() {

    return new Promise(function(resolve, reject) {

        const anfrage = indexedDB.open(
            FOTO_DB_NAME,
            FOTO_DB_VERSION
        );

        anfrage.onupgradeneeded = function(event) {

            const datenbank = event.target.result;

            if (
                !datenbank.objectStoreNames.contains(
                    FOTO_STORE_NAME
                )
            ) {

                const speicher =
                    datenbank.createObjectStore(
                        FOTO_STORE_NAME,
                        {
                            keyPath: "id"
                        }
                    );

                /*
                 * Damit alle Fotos eines Auftrags
                 * schnell gefunden werden können.
                 */
                speicher.createIndex(
                    "auftragID",
                    "auftragID",
                    {
                        unique: false
                    }
                );
            }
        };

        anfrage.onsuccess = function(event) {
            resolve(event.target.result);
        };

        anfrage.onerror = function() {

            reject(
                anfrage.error ||
                new Error(
                    "Die Fotodatenbank konnte nicht geöffnet werden."
                )
            );
        };

    });
}


/*
 * Eindeutige Foto-ID erzeugen.
 */
function neueFotoID() {

    if (
        window.crypto &&
        typeof window.crypto.randomUUID === "function"
    ) {
        return window.crypto.randomUUID();
    }

    return (
        Date.now().toString() +
        "-" +
        Math.random()
            .toString(16)
            .slice(2)
    );
}


/*
 * Neues Foto speichern.
 */
async function fotoDBSpeichern(foto) {

    const datenbank =
        await fotoDatenbankOeffnen();

    return new Promise(function(resolve, reject) {

        const transaktion =
            datenbank.transaction(
                FOTO_STORE_NAME,
                "readwrite"
            );

        const speicher =
            transaktion.objectStore(
                FOTO_STORE_NAME
            );

        const eintrag = {
            id:
                foto.id ||
                neueFotoID(),

            auftragID:
                String(foto.auftragID),

            bild:
                foto.bild,

            datum:
                foto.datum || "",

            uhrzeit:
                foto.uhrzeit || "",

            beschreibung:
                foto.beschreibung || "",

            erstelltAm:
                foto.erstelltAm ||
                new Date().toISOString()
        };

        const anfrage =
            speicher.put(eintrag);

        anfrage.onsuccess = function() {
            resolve(eintrag);
        };

        anfrage.onerror = function() {

            reject(
                anfrage.error ||
                new Error(
                    "Das Foto konnte nicht gespeichert werden."
                )
            );
        };

        transaktion.oncomplete = function() {
            datenbank.close();
        };

    });
}


/*
 * Alle Fotos eines Auftrags laden.
 */
async function fotoDBAlleFuerAuftrag(
    auftragID
) {

    const datenbank =
        await fotoDatenbankOeffnen();

    return new Promise(function(resolve, reject) {

        const transaktion =
            datenbank.transaction(
                FOTO_STORE_NAME,
                "readonly"
            );

        const speicher =
            transaktion.objectStore(
                FOTO_STORE_NAME
            );

        const index =
            speicher.index("auftragID");

        const anfrage =
            index.getAll(
                String(auftragID)
            );

        anfrage.onsuccess = function() {

            const fotos =
                anfrage.result || [];

            /*
             * Älteste Fotos zuerst anzeigen.
             */
            fotos.sort(function(a, b) {

                return String(
                    a.erstelltAm || ""
                ).localeCompare(
                    String(
                        b.erstelltAm || ""
                    )
                );
            });

            resolve(fotos);
        };

        anfrage.onerror = function() {

            reject(
                anfrage.error ||
                new Error(
                    "Die Fotos konnten nicht geladen werden."
                )
            );
        };

        transaktion.oncomplete = function() {
            datenbank.close();
        };

    });
}


/*
 * Einzelnes Foto über seine ID laden.
 */
async function fotoDBLaden(fotoID) {

    const datenbank =
        await fotoDatenbankOeffnen();

    return new Promise(function(resolve, reject) {

        const transaktion =
            datenbank.transaction(
                FOTO_STORE_NAME,
                "readonly"
            );

        const speicher =
            transaktion.objectStore(
                FOTO_STORE_NAME
            );

        const anfrage =
            speicher.get(fotoID);

        anfrage.onsuccess = function() {

            resolve(
                anfrage.result || null
            );
        };

        anfrage.onerror = function() {

            reject(
                anfrage.error ||
                new Error(
                    "Das Foto konnte nicht geladen werden."
                )
            );
        };

        transaktion.oncomplete = function() {
            datenbank.close();
        };

    });
}


/*
 * Einzelnes Foto löschen.
 */
async function fotoDBLoeschen(fotoID) {

    const datenbank =
        await fotoDatenbankOeffnen();

    return new Promise(function(resolve, reject) {

        const transaktion =
            datenbank.transaction(
                FOTO_STORE_NAME,
                "readwrite"
            );

        const speicher =
            transaktion.objectStore(
                FOTO_STORE_NAME
            );

        const anfrage =
            speicher.delete(fotoID);

        anfrage.onsuccess = function() {
            resolve();
        };

        anfrage.onerror = function() {

            reject(
                anfrage.error ||
                new Error(
                    "Das Foto konnte nicht gelöscht werden."
                )
            );
        };

        transaktion.oncomplete = function() {
            datenbank.close();
        };

    });
}


/*
 * Alle Fotos eines Auftrags löschen.
 * Wird später beim Löschen eines Auftrags benötigt.
 */
async function fotoDBAlleFuerAuftragLoeschen(
    auftragID
) {

    const fotos =
        await fotoDBAlleFuerAuftrag(
            auftragID
        );

    for (const foto of fotos) {
        await fotoDBLoeschen(foto.id);
    }
}


/*
 * Anzahl der Fotos eines Auftrags ermitteln.
 */
async function fotoDBAnzahlFuerAuftrag(
    auftragID
) {

    const fotos =
        await fotoDBAlleFuerAuftrag(
            auftragID
        );

    return fotos.length;
}