const auftragID = localStorage.getItem("RFE_AKTUELLER_AUFTRAG");
const regieIndex = localStorage.getItem("RFE_REGIE_INDEX");

let auftrag = getAuftrag(auftragID);

if (!auftrag) {

    alert("Auftrag nicht gefunden.");

    location.href = "archiv.html";

}

if (!auftrag.regieberichte) {

    auftrag.regieberichte = [];

}

const datum = document.getElementById("datum");
const monteur = document.getElementById("monteur");
const beginn = document.getElementById("beginn");
const ende = document.getElementById("ende");
const pause = document.getElementById("pause");
const stunden = document.getElementById("stunden");
const arbeiten = document.getElementById("arbeiten");
const bemerkung = document.getElementById("bemerkung");

datum.value = new Date().toISOString().substring(0,10);
monteur.value = auftrag.monteur || "";

if (regieIndex !== null) {

    const eintrag = auftrag.regieberichte[Number(regieIndex)];

    if (eintrag) {

        document.getElementById("titel").innerText =
        "Regiebericht bearbeiten";

        datum.value = eintrag.datum || "";
        monteur.value = eintrag.monteur || "";
        beginn.value = eintrag.beginn || "";
        ende.value = eintrag.ende || "";
        pause.value = eintrag.pause || 30;
        stunden.value = eintrag.stunden || "";
        arbeiten.value = eintrag.arbeiten || "";
        bemerkung.value = eintrag.bemerkung || "";

    }

}

function stundenBerechnen(){

    if(beginn.value==="" || ende.value===""){

        return;

    }

    const start = new Date("2000-01-01T"+beginn.value);
    const stop = new Date("2000-01-01T"+ende.value);

    let minuten = (stop-start)/1000/60;

    minuten -= Number(pause.value);

    if(minuten<0){

        minuten = 0;

    }

    stunden.value = (minuten/60).toFixed(2);

}

function speichern(){

    const eintrag = {

        datum: datum.value,
        monteur: monteur.value,
        beginn: beginn.value,
        ende: ende.value,
        pause: pause.value,
        stunden: stunden.value,
        arbeiten: arbeiten.value,
        bemerkung: bemerkung.value

    };

    if(regieIndex===null){

        auftrag.regieberichte.push(eintrag);

    }else{

        auftrag.regieberichte[Number(regieIndex)] = eintrag;

    }

    updateAuftrag(auftragID, auftrag);

    localStorage.removeItem("RFE_REGIE_INDEX");

    location.href = "regieberichte.html";

}