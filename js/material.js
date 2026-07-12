const auftragID = localStorage.getItem("RFE_AKTUELLER_AUFTRAG");

const auftrag = getAuftrag(auftragID);

if (!auftrag) {

    alert("Auftrag nicht gefunden.");

    location.href = "archiv.html";

}

if (!auftrag.material) {

    auftrag.material = [];

    updateAuftrag(auftragID, auftrag);

}

anzeigen();

function anzeigen() {

    const liste = document.getElementById("liste");

    liste.innerHTML = "";

    if (auftrag.material.length === 0) {

        liste.innerHTML = "<p>Noch kein Material erfasst.</p>";

        return;

    }

    auftrag.material.forEach(function(pos, index) {

        liste.innerHTML += `

        <div class="auftrag">

            <strong>${pos.bezeichnung}</strong><br>

            ${pos.menge} ${pos.einheit}

            <br><br>

            <button onclick="bearbeiten(${index})">

                ✏️ Bearbeiten

            </button>

            <button onclick="loeschen(${index})">

                🗑️ Löschen

            </button>

        </div>

        `;

    });

}

function neuePosition() {

    localStorage.removeItem("RFE_MATERIAL_INDEX");

    location.href = "material_position.html";

}

function bearbeiten(index) {

    localStorage.setItem("RFE_MATERIAL_INDEX", index);

    location.href = "material_position.html";

}

function loeschen(index) {

    if (!confirm("Materialposition wirklich löschen?")) {

        return;

    }

    auftrag.material.splice(index,1);

    updateAuftrag(auftragID, auftrag);

    anzeigen();

}