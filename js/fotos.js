const auftragID =
    localStorage.getItem("RFE_AKTUELLER_AUFTRAG");

const auftrag =
    getAuftrag(auftragID);

if (!auftrag) {

    alert("Auftrag nicht gefunden.");

    location.href = "archiv.html";
}

/*
 * Fotos aus IndexedDB laden
 */
anzeigen();


async function anzeigen() {

    const liste =
        document.getElementById("liste");

    liste.innerHTML = "";

    const fotos =
        await fotoDBAlleFuerAuftrag(
            auftragID
        );

    if (fotos.length === 0) {

        liste.innerHTML =
            "<p>Noch keine Fotos vorhanden.</p>";

        return;
    }

    fotos.forEach(function(foto) {

        liste.innerHTML += `

        <div class="auftrag">

            <img
                src="${foto.bild}"
                style="
                    width:100%;
                    border-radius:8px;
                    max-height:220px;
                    object-fit:cover;
                ">

            <br>

            <small>

                ${foto.datum}
                &nbsp;
                ${foto.uhrzeit}

            </small>

            <br><br>

            <button
                onclick="anzeigenFoto('${foto.id}')">

                🔍 Anzeigen

            </button>

            <button
                onclick="loeschen('${foto.id}')">

                🗑️ Löschen

            </button>

        </div>

        `;

    });

}


function neuesFoto() {

    localStorage.removeItem(
        "RFE_FOTO_ID"
    );

    location.href = "foto.html";
}


function anzeigenFoto(fotoID) {

    localStorage.setItem(
        "RFE_FOTO_ID",
        fotoID
    );

    location.href =
        "foto.html";
}


async function loeschen(fotoID) {

    if (
        !confirm(
            "Foto wirklich löschen?"
        )
    ) {

        return;
    }

    try {

        await fotoDBLoeschen(
            fotoID
        );

        anzeigen();

    } catch (fehler) {

        console.error(
            fehler
        );

        alert(
            "Foto konnte nicht gelöscht werden."
        );
    }

}