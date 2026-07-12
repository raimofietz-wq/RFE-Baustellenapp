const auftragID = localStorage.getItem("RFE_AKTUELLER_AUFTRAG");
const auftrag = getAuftrag(auftragID);

if (!auftrag) {
    alert("Auftrag nicht gefunden.");
    location.href = "archiv.html";
}

if (!auftrag.regieberichte) {
    auftrag.regieberichte = [];
    updateAuftrag(auftragID, auftrag);
}

anzeigen();

function anzeigen() {

    const liste = document.getElementById("liste");
    liste.innerHTML = "";

    if (auftrag.regieberichte.length === 0) {
        liste.innerHTML = "<p>Noch keine Regieberichte vorhanden.</p>";
        return;
    }

    auftrag.regieberichte.forEach(function(eintrag, index) {

        liste.innerHTML += `
            <div class="auftrag">
                <strong>${eintrag.datum || "Ohne Datum"}</strong><br>
                Monteur: ${eintrag.monteur || ""}<br>
                Stunden: ${eintrag.stunden || "0.00"}<br><br>

                <button onclick="oeffnen(${index})">
                    Öffnen
                </button>

                <button onclick="loeschen(${index})">
                    Löschen
                </button>
            </div>
        `;

    });
}

function neuerBericht() {
    localStorage.removeItem("RFE_REGIE_INDEX");
    location.href = "regiebericht.html";
}

function oeffnen(index) {
    localStorage.setItem("RFE_REGIE_INDEX", index);
    location.href = "regiebericht.html";
}

function loeschen(index) {

    if (!confirm("Regiebericht wirklich löschen?")) {
        return;
    }

    auftrag.regieberichte.splice(index, 1);
    updateAuftrag(auftragID, auftrag);

    anzeigen();
}