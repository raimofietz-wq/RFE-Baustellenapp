const auftragID = localStorage.getItem("RFE_AKTUELLER_AUFTRAG");
const materialIndex = localStorage.getItem("RFE_MATERIAL_INDEX");

let auftrag = getAuftrag(auftragID);

if (!auftrag) {
    alert("Auftrag nicht gefunden.");
    location.href = "archiv.html";
}

if (!auftrag.material) {
    auftrag.material = [];
}

const bezeichnung = document.getElementById("bezeichnung");
const menge = document.getElementById("menge");
const einheit = document.getElementById("einheit");

if (materialIndex !== null) {

    const pos = auftrag.material[Number(materialIndex)];

    if (pos) {
        document.getElementById("titel").innerText =
            "Materialposition bearbeiten";

        bezeichnung.value = pos.bezeichnung || "";
        menge.value = pos.menge || "";
        einheit.value = pos.einheit || "Stk";
    }
}

function speichern() {

    if (bezeichnung.value.trim() === "") {
        alert("Bitte eine Bezeichnung eingeben.");
        return;
    }

    const position = {
        bezeichnung: bezeichnung.value.trim(),
        menge: menge.value,
        einheit: einheit.value
    };

    if (materialIndex === null) {
        auftrag.material.push(position);
    } else {
        auftrag.material[Number(materialIndex)] = position;
    }

    updateAuftrag(auftragID, auftrag);

    localStorage.removeItem("RFE_MATERIAL_INDEX");

    location.href = "material.html";
}