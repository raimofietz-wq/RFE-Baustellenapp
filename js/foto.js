const auftragID = localStorage.getItem("RFE_AKTUELLER_AUFTRAG");
const fotoIndex = localStorage.getItem("RFE_FOTO_INDEX");

let auftrag = getAuftrag(auftragID);

if (!auftrag) {

    alert("Auftrag nicht gefunden.");

    location.href = "archiv.html";

}

if (!auftrag.fotos) {

    auftrag.fotos = [];

}

const fotoInput = document.getElementById("foto");
const vorschau = document.getElementById("vorschau");

let bild = null;

if (fotoIndex !== null) {

    const eintrag = auftrag.fotos[Number(fotoIndex)];

    if (eintrag) {

        document.getElementById("titel").innerText =
            "Foto anzeigen";

        bild = eintrag.bild;

        vorschau.src = bild;
        vorschau.style.display = "block";

    }

}

fotoInput.addEventListener("change", function(e) {

    const datei = e.target.files[0];

    if (!datei) return;

    const reader = new FileReader();

    reader.onload = function(evt) {

        bild = evt.target.result;

        vorschau.src = bild;
        vorschau.style.display = "block";

    };

    reader.readAsDataURL(datei);

});

function speichern() {

    if (!bild) {

        alert("Bitte zuerst ein Foto auswählen.");

        return;

    }

    const eintrag = {

        bild: bild,

        datum: new Date().toLocaleDateString("de-DE"),

        uhrzeit: new Date().toLocaleTimeString("de-DE")

    };

    if (fotoIndex === null) {

        auftrag.fotos.push(eintrag);

    } else {

        auftrag.fotos[Number(fotoIndex)] = eintrag;

    }

    updateAuftrag(auftragID, auftrag);

    localStorage.removeItem("RFE_FOTO_INDEX");

    location.href = "fotos.html";

}