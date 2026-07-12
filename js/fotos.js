const auftragID = localStorage.getItem("RFE_AKTUELLER_AUFTRAG");

const auftrag = getAuftrag(auftragID);

if (!auftrag) {

    alert("Auftrag nicht gefunden.");

    location.href = "archiv.html";

}

if (!auftrag.fotos) {

    auftrag.fotos = [];

    updateAuftrag(auftragID, auftrag);

}

anzeigen();

function anzeigen() {

    const liste = document.getElementById("liste");

    liste.innerHTML = "";

    if (auftrag.fotos.length === 0) {

        liste.innerHTML = "<p>Noch keine Fotos vorhanden.</p>";

        return;

    }

    auftrag.fotos.forEach(function(foto, index) {

        liste.innerHTML += `

        <div class="auftrag">

            <img src="${foto.bild}" style="width:100%;border-radius:8px;max-height:220px;object-fit:cover;">

<br>

<small>

${foto.datum} &nbsp; ${foto.uhrzeit}

</small>

            <br><br>

            <button onclick="anzeigenFoto(${index})">

                🔍 Anzeigen

            </button>

            <button onclick="loeschen(${index})">

                🗑️ Löschen

            </button>

        </div>

        `;

    });

}

function neuesFoto(){

    location.href = "foto.html";

}

function anzeigenFoto(index){

    localStorage.setItem("RFE_FOTO_INDEX", index);

    location.href = "foto.html";

}

function loeschen(index){

    if(!confirm("Foto löschen?")){

        return;

    }

    auftrag.fotos.splice(index,1);

    updateAuftrag(auftragID, auftrag);

    anzeigen();

}