const STORAGE_KEY = "RFE_AUFTRAEGE";

/* Alle Aufträge laden */
function getAuftraege() {

    const daten = localStorage.getItem(STORAGE_KEY);

    if (!daten) {
        return [];
    }

    const liste = JSON.parse(daten);

    liste.forEach(function(a) {

        if (!a.taetigkeitsnachweise) {

            a.taetigkeitsnachweise = [];

            if (a.taetigkeitsnachweis) {
                a.taetigkeitsnachweise.push(a.taetigkeitsnachweis);
                delete a.taetigkeitsnachweis;
            }

        }

        if (!a.regieberichte) {

            a.regieberichte = [];

            if (a.regiebericht) {
                a.regieberichte.push(a.regiebericht);
                delete a.regiebericht;
            }

        }

        if (!a.material) {
            a.material = [];
        }

        if (!a.fotos) {
            a.fotos = [];
        }

        if (!a.unterschriften) {

            a.unterschriften = [];

            if (a.unterschrift) {
                a.unterschriften.push(a.unterschrift);
                delete a.unterschrift;
            }

        }

    });

    return liste;

}

/* Alle Aufträge speichern */
function saveAuftraege(liste) {

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(liste)
    );

}

/* Auftrag hinzufügen */
function addAuftrag(auftrag) {

    const liste = getAuftraege();

    if (!auftrag.id) {
        auftrag.id = Date.now().toString();
    }

    liste.push(auftrag);

    saveAuftraege(liste);

}

/* Auftrag suchen */
function getAuftrag(id) {

    const liste = getAuftraege();

    return liste.find(function(a) {

        return String(a.id) === String(id);

    });

}

/* Auftrag aktualisieren */
function updateAuftrag(id, auftrag) {

    let liste = getAuftraege();

    liste = liste.map(function(a) {

        if (String(a.id) === String(id)) {
            return auftrag;
        }

        return a;

    });

    saveAuftraege(liste);

}

/* Auftrag löschen */
function deleteAuftrag(id) {

    let liste = getAuftraege();

    liste = liste.filter(function(a) {

        return String(a.id) !== String(id);

    });

    saveAuftraege(liste);

}