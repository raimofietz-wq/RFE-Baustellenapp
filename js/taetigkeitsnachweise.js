const auftragID = localStorage.getItem("RFE_AKTUELLER_AUFTRAG");

const auftrag = getAuftrag(auftragID);

if (!auftrag) {

    alert("Auftrag nicht gefunden.");

    location.href = "archiv.html";

}

if (!auftrag.taetigkeitsnachweise) {

    auftrag.taetigkeitsnachweise = [];

}

anzeigen();

function anzeigen() {

    const liste = document.getElementById("liste");

    liste.innerHTML = "";

    if (auftrag.taetigkeitsnachweise.length === 0) {

        liste.innerHTML = "<p>Noch keine Tätigkeitsnachweise vorhanden.</p>";

        return;

    }

    auftrag.taetigkeitsnachweise.forEach(function(eintrag, index) {

        liste.innerHTML += `

        <div class="auftrag">

            <strong>${eintrag.datum}</strong><br>

            Monteur: ${eintrag.monteur}<br>

            Stunden: ${eintrag.stunden}

            <br><br>

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

function neuerNachweis() {

    localStorage.removeItem("RFE_TAETIGKEIT_INDEX");

    location.href = "taetigkeitsnachweis.html";

}

function oeffnen(index) {

    localStorage.setItem("RFE_TAETIGKEIT_INDEX", index);

    location.href = "taetigkeitsnachweis.html";

}

function loeschen(index) {

    if (!confirm("Tätigkeitsnachweis löschen?")) {

        return;

    }

    auftrag.taetigkeitsnachweise.splice(index, 1);

    updateAuftrag(auftragID, auftrag);

    anzeigen();

}