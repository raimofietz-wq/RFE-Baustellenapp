const auftragID = localStorage.getItem("RFE_AKTUELLER_AUFTRAG");
const eintragIndex = localStorage.getItem("RFE_TAETIGKEIT_INDEX");

let auftrag = getAuftrag(auftragID);

if (!auftrag) {

    alert("Auftrag nicht gefunden.");

    location.href = "archiv.html";

}

if (!auftrag.taetigkeitsnachweise) {

    auftrag.taetigkeitsnachweise = [];

}

document.getElementById("datum").value =
new Date().toISOString().substring(0,10);

document.getElementById("monteur").value =
auftrag.monteur || "";

if (eintragIndex !== null) {

    const e = auftrag.taetigkeitsnachweise[eintragIndex];

    if (e) {

        document.getElementById("titel").innerHTML =
        "Tätigkeitsnachweis bearbeiten";

        document.getElementById("datum").value = e.datum || "";
        document.getElementById("monteur").value = e.monteur || "";
        document.getElementById("beginn").value = e.beginn || "";
        document.getElementById("ende").value = e.ende || "";
        document.getElementById("pause").value = e.pause || 30;
        document.getElementById("stunden").value = e.stunden || "";
        document.getElementById("taetigkeit").value = e.taetigkeit || "";

    }

}

function stundenBerechnen() {

    const beginn = document.getElementById("beginn").value;
    const ende = document.getElementById("ende").value;

    if (beginn === "" || ende === "") return;

    const start = new Date("2000-01-01 " + beginn);
    const stop = new Date("2000-01-01 " + ende);

    let minuten = (stop - start) / 1000 / 60;

    minuten -= Number(document.getElementById("pause").value);

    if (minuten < 0) minuten = 0;

    document.getElementById("stunden").value =
    (minuten / 60).toFixed(2);

}

function speichern() {

    const eintrag = {

        datum: document.getElementById("datum").value,
        monteur: document.getElementById("monteur").value,
        beginn: document.getElementById("beginn").value,
        ende: document.getElementById("ende").value,
        pause: document.getElementById("pause").value,
        stunden: document.getElementById("stunden").value,
        taetigkeit: document.getElementById("taetigkeit").value

    };

    if (eintragIndex === null) {

        auftrag.taetigkeitsnachweise.push(eintrag);

    } else {

        auftrag.taetigkeitsnachweise[eintragIndex] = eintrag;

    }

    updateAuftrag(auftragID, auftrag);

    localStorage.removeItem("RFE_TAETIGKEIT_INDEX");

    location.href = "taetigkeitsnachweise.html";

}