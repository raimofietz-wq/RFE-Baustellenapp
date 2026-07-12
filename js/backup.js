function backupErstellen() {

    const auftraege = getAuftraege();

    const backup = {
        app: "RFE BaustellenApp",
        version: "1.0",
        erstelltAm: new Date().toISOString(),
        auftraege: auftraege
    };

    const inhalt = JSON.stringify(backup, null, 2);

    const blob = new Blob(
        [inhalt],
        { type: "application/json" }
    );

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    const datum = new Date()
        .toISOString()
        .substring(0, 10);

    link.href = url;
    link.download = "RFE_Backup_" + datum + ".json";

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);
}

function backupImportieren() {

    const dateiFeld =
        document.getElementById("backupDatei");

    const datei = dateiFeld.files[0];

    if (!datei) {
        alert("Bitte zuerst eine Backup-Datei auswählen.");
        return;
    }

    if (!confirm(
        "Die vorhandenen Aufträge werden durch das Backup ersetzt. Fortfahren?"
    )) {
        return;
    }

    const reader = new FileReader();

    reader.onload = function(event) {

        try {

            const backup = JSON.parse(event.target.result);

            if (
                !backup ||
                !Array.isArray(backup.auftraege)
            ) {
                throw new Error("Ungültiges Backup");
            }

            saveAuftraege(backup.auftraege);

            localStorage.removeItem(
                "RFE_AKTUELLER_AUFTRAG"
            );

            localStorage.removeItem(
                "RFE_BEARBEITEN"
            );

            localStorage.removeItem(
                "RFE_TAETIGKEIT_INDEX"
            );

            localStorage.removeItem(
                "RFE_REGIE_INDEX"
            );

            localStorage.removeItem(
                "RFE_MATERIAL_INDEX"
            );

            localStorage.removeItem(
                "RFE_FOTO_INDEX"
            );

            alert(
                backup.auftraege.length +
                " Auftrag/Aufträge wurden wiederhergestellt."
            );

            location.href = "archiv.html";

        } catch (fehler) {

            console.error(fehler);

            alert(
                "Die Datei ist kein gültiges RFE-Backup."
            );

        }

    };

    reader.readAsText(datei);
}