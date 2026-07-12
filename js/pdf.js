/* =========================================================
   RFE BaustellenApp – PDF Export
   ========================================================= */

const auftragID =
    localStorage.getItem("RFE_AKTUELLER_AUFTRAG");

if (!auftragID) {
    alert("Kein Auftrag ausgewählt.");
    location.href = "archiv.html";
    throw new Error("Kein Auftrag ausgewählt.");
}

const auftrag = getAuftrag(auftragID);

if (!auftrag) {
    alert("Auftrag nicht gefunden.");
    location.href = "archiv.html";
    throw new Error("Auftrag nicht gefunden.");
}

const infoElement = document.getElementById("info");

if (infoElement) {
    infoElement.innerText =
        "Auftrag " + (auftrag.nummer || "");
}


/* =========================================================
   Allgemeine Hilfsfunktionen
   ========================================================= */

function wert(text) {
    return String(text ?? "");
}


function datumDeutsch(datum) {

    if (!datum) {
        return "";
    }

    const teile = String(datum).split("-");

    if (teile.length !== 3) {
        return String(datum);
    }

    return (
        teile[2] +
        "." +
        teile[1] +
        "." +
        teile[0]
    );
}


function dateinameBereinigen(text) {

    return wert(text)
        .replace(/[\\/:*?"<>|]/g, "_")
        .trim();
}


function bildFormat(dataURL) {

    if (
        typeof dataURL === "string" &&
        dataURL.startsWith("data:image/png")
    ) {
        return "PNG";
    }

    if (
        typeof dataURL === "string" &&
        (
            dataURL.startsWith("data:image/jpeg") ||
            dataURL.startsWith("data:image/jpg")
        )
    ) {
        return "JPEG";
    }

    if (
        typeof dataURL === "string" &&
        dataURL.startsWith("data:image/webp")
    ) {
        return "WEBP";
    }

    return "JPEG";
}


function bildLaden(quelle) {

    return new Promise(function(resolve, reject) {

        const bild = new Image();

        bild.onload = function() {
            resolve(bild);
        };

        bild.onerror = function() {
            reject(
                new Error(
                    "Bild konnte nicht geladen werden."
                )
            );
        };

        bild.src = quelle;

    });
}


async function dateiAlsDataURL(pfad) {

    const url =
        new URL(pfad, window.location.href).href;

    const antwort = await fetch(url);

    if (!antwort.ok) {

        throw new Error(
            "Datei konnte nicht geladen werden: " +
            antwort.status
        );
    }

    const blob = await antwort.blob();

    return await new Promise(
        function(resolve, reject) {

            const reader = new FileReader();

            reader.onload = function() {
                resolve(reader.result);
            };

            reader.onerror = function() {
                reject(reader.error);
            };

            reader.readAsDataURL(blob);

        }
    );
}


/* =========================================================
   PDF erstellen
   ========================================================= */

async function pdfErstellen() {

    if (
        !window.jspdf ||
        !window.jspdf.jsPDF
    ) {

        alert(
            "Die PDF-Bibliothek konnte nicht geladen werden."
        );

        console.error(
            "window.jspdf.jsPDF ist nicht verfügbar."
        );

        return;
    }

    const { jsPDF } = window.jspdf;

    const pdf =
        new jsPDF("p", "mm", "a4");

    const seitenBreite = 210;
    const seitenHoehe = 297;

    const randLinks = 18;
    const randRechts = 18;

    const inhaltBreite =
        seitenBreite -
        randLinks -
        randRechts;

    let y = 18;


    /* =====================================================
       Seitenverwaltung
       ===================================================== */

    function zeichneKleinenSeitenkopf() {

        pdf.setFont(
            "helvetica",
            "bold"
        );

        pdf.setFontSize(10);

        pdf.setTextColor(
            11,
            78,
            162
        );

        pdf.text(
            "Raimo Fietz Elektrotechnik",
            randLinks,
            y
        );

        pdf.setFont(
            "helvetica",
            "normal"
        );

        pdf.setTextColor(
            80,
            88,
            98
        );

        pdf.text(
            "Auftrag " +
            wert(auftrag.nummer),
            seitenBreite - randRechts,
            y,
            {
                align: "right"
            }
        );

        y += 6;

        pdf.setDrawColor(
            190,
            198,
            208
        );

        pdf.setLineWidth(0.3);

        pdf.line(
            randLinks,
            y,
            seitenBreite - randRechts,
            y
        );

        y += 8;
    }


    function neueSeite() {

        pdf.addPage();

        y = 18;

        zeichneKleinenSeitenkopf();
    }


    function pruefePlatz(hoehe) {

        if (y + hoehe > 276) {
            neueSeite();
        }
    }


    function trennlinie() {

        pruefePlatz(10);

        pdf.setDrawColor(
            190,
            198,
            208
        );

        pdf.setLineWidth(0.3);

        pdf.line(
            randLinks,
            y,
            seitenBreite - randRechts,
            y
        );

        y += 7;
    }


    function abschnittTitel(text) {

        pruefePlatz(16);

        pdf.setFillColor(
            11,
            78,
            162
        );

        pdf.roundedRect(
            randLinks,
            y,
            inhaltBreite,
            9,
            2,
            2,
            "F"
        );

        pdf.setTextColor(
            255,
            255,
            255
        );

        pdf.setFont(
            "helvetica",
            "bold"
        );

        pdf.setFontSize(12);

        pdf.text(
            text,
            randLinks + 4,
            y + 6
        );

        pdf.setTextColor(
            32,
            37,
            43
        );

        y += 14;
    }


    /* =====================================================
       Firmenkopf
       ===================================================== */

    async function zeichneFirmenkopf() {

        try {

            const logoDaten =
                await dateiAlsDataURL(
                    "../assets/logo.png"
                );

            pdf.addImage(
                logoDaten,
                "PNG",
                randLinks,
                y,
                28,
                28
            );

        } catch (fehler) {

            console.warn(
                "Logo konnte nicht eingefügt werden:",
                fehler
            );
        }

        pdf.setTextColor(
            11,
            78,
            162
        );

        pdf.setFont(
            "helvetica",
            "bold"
        );

        pdf.setFontSize(18);

        pdf.text(
            "Raimo Fietz Elektrotechnik",
            randLinks + 35,
            y + 7
        );

        pdf.setTextColor(
            50,
            57,
            65
        );

        pdf.setFont(
            "helvetica",
            "normal"
        );

        pdf.setFontSize(9.5);

        pdf.text(
            "Kneist 27 · 24147 Kiel",
            randLinks + 35,
            y + 14
        );

        pdf.text(
            "Telefon: 0172 3524191",
            randLinks + 35,
            y + 20
        );

        pdf.text(
            "E-Mail: raimofietz@gmail.com",
            randLinks + 35,
            y + 26
        );

        pdf.setTextColor(
            11,
            78,
            162
        );

        pdf.setFont(
            "helvetica",
            "bold"
        );

        pdf.setFontSize(11);

        pdf.text(
            "Auftrag " +
            wert(auftrag.nummer),
            seitenBreite - randRechts,
            y + 7,
            {
                align: "right"
            }
        );

        y += 34;

        pdf.setDrawColor(
            11,
            78,
            162
        );

        pdf.setLineWidth(0.8);

        pdf.line(
            randLinks,
            y,
            seitenBreite - randRechts,
            y
        );

        y += 9;

        pdf.setTextColor(
            32,
            37,
            43
        );

        pdf.setFontSize(17);

        pdf.setFont(
            "helvetica",
            "bold"
        );

        pdf.text(
            "BAUSTELLENDOKUMENTATION",
            randLinks,
            y
        );

        y += 10;
    }


    /* =====================================================
       Auftragsdaten
       ===================================================== */

    function feld(
        label,
        text,
        x,
        breite
    ) {

        pdf.setFont(
            "helvetica",
            "bold"
        );

        pdf.setFontSize(8.5);

        pdf.setTextColor(
            90,
            99,
            110
        );

        pdf.text(
            label,
            x,
            y
        );

        pdf.setFont(
            "helvetica",
            "normal"
        );

        pdf.setFontSize(10.5);

        pdf.setTextColor(
            32,
            37,
            43
        );

        const zeilen =
            pdf.splitTextToSize(
                wert(text),
                breite
            );

        pdf.text(
            zeilen,
            x,
            y + 5
        );

        return Math.max(
            10,
            zeilen.length * 5 + 5
        );
    }


    function zeichneAuftragsdaten() {

        abschnittTitel(
            "Auftragsdaten"
        );

        const spalte = 83;

        let hoeheLinks = feld(
            "AUFTRAGSNUMMER",
            auftrag.nummer,
            randLinks,
            spalte
        );

        let hoeheRechts = feld(
            "DATUM",
            datumDeutsch(
                auftrag.datum
            ),
            randLinks + 91,
            spalte
        );

        y += Math.max(
            hoeheLinks,
            hoeheRechts
        ) + 4;

        hoeheLinks = feld(
            "KUNDE",
            auftrag.kunde,
            randLinks,
            spalte
        );

        hoeheRechts = feld(
            "ANSPRECHPARTNER",
            auftrag.ansprechpartner,
            randLinks + 91,
            spalte
        );

        y += Math.max(
            hoeheLinks,
            hoeheRechts
        ) + 4;

        hoeheLinks = feld(
            "BAUSTELLE",
            auftrag.baustelle,
            randLinks,
            inhaltBreite
        );

        y += hoeheLinks + 4;

        hoeheLinks = feld(
            "MONTEUR",
            auftrag.monteur,
            randLinks,
            spalte
        );

        hoeheRechts = feld(
            "TELEFON",
            auftrag.telefon,
            randLinks + 91,
            spalte
        );

        y += Math.max(
            hoeheLinks,
            hoeheRechts
        ) + 3;

        trennlinie();
    }


    /* =====================================================
       Tätigkeitsnachweise
       ===================================================== */

    function zeichneTaetigkeitsnachweise() {

        abschnittTitel(
            "Tätigkeitsnachweise"
        );

        const liste =
            auftrag.taetigkeitsnachweise ||
            [];

        if (liste.length === 0) {

            pdf.setFont(
                "helvetica",
                "normal"
            );

            pdf.setFontSize(10);

            pdf.setTextColor(
                100,
                108,
                118
            );

            pdf.text(
                "Keine Tätigkeitsnachweise vorhanden.",
                randLinks,
                y
            );

            y += 10;

            return;
        }

        let gesamt = 0;

        liste.forEach(
            function(eintrag, index) {

                pruefePlatz(30);

                pdf.setFillColor(
                    234,
                    242,
                    252
                );

                pdf.roundedRect(
                    randLinks,
                    y,
                    inhaltBreite,
                    11,
                    2,
                    2,
                    "F"
                );

                pdf.setFont(
                    "helvetica",
                    "bold"
                );

                pdf.setFontSize(10);

                pdf.setTextColor(
                    11,
                    78,
                    162
                );

                pdf.text(
                    datumDeutsch(
                        eintrag.datum
                    ),
                    randLinks + 4,
                    y + 7
                );

                pdf.setFont(
                    "helvetica",
                    "normal"
                );

                pdf.setTextColor(
                    32,
                    37,
                    43
                );

                pdf.text(
                    wert(
                        eintrag.monteur
                    ),
                    randLinks + 54,
                    y + 7
                );

                pdf.text(
                    wert(
                        eintrag.stunden
                    ) + " Std.",
                    seitenBreite -
                    randRechts -
                    4,
                    y + 7,
                    {
                        align: "right"
                    }
                );

                y += 16;

                const text =
                    pdf.splitTextToSize(
                        wert(
                            eintrag.taetigkeit
                        ),
                        inhaltBreite - 4
                    );

                pruefePlatz(
                    text.length * 5 + 8
                );

                pdf.setFontSize(9.5);

                pdf.setTextColor(
                    45,
                    51,
                    59
                );

                pdf.text(
                    text,
                    randLinks + 2,
                    y
                );

                y +=
                    text.length * 5 +
                    8;

                gesamt += Number(
                    eintrag.stunden ||
                    0
                );

                if (
                    index <
                    liste.length - 1
                ) {

                    pdf.setDrawColor(
                        220,
                        224,
                        230
                    );

                    pdf.line(
                        randLinks,
                        y - 3,
                        seitenBreite -
                        randRechts,
                        y - 3
                    );
                }

            }
        );

        pruefePlatz(12);

        pdf.setFont(
            "helvetica",
            "bold"
        );

        pdf.setFontSize(10.5);

        pdf.setTextColor(
            32,
            37,
            43
        );

        pdf.text(
            "Gesamtstunden:",
            randLinks,
            y
        );

        pdf.text(
            gesamt.toFixed(2),
            seitenBreite -
            randRechts,
            y,
            {
                align: "right"
            }
        );

        y += 10;
    }


    /* =====================================================
       Regieberichte
       ===================================================== */

    function zeichneRegieberichte() {

        abschnittTitel(
            "Regieberichte"
        );

        const liste =
            auftrag.regieberichte ||
            [];

        if (liste.length === 0) {

            pdf.setFont(
                "helvetica",
                "normal"
            );

            pdf.setFontSize(10);

            pdf.setTextColor(
                100,
                108,
                118
            );

            pdf.text(
                "Keine Regieberichte vorhanden.",
                randLinks,
                y
            );

            y += 10;

            return;
        }

        liste.forEach(
            function(eintrag, index) {

                pruefePlatz(30);

                pdf.setFont(
                    "helvetica",
                    "bold"
                );

                pdf.setFontSize(10.5);

                pdf.setTextColor(
                    11,
                    78,
                    162
                );

                pdf.text(
                    datumDeutsch(
                        eintrag.datum
                    ),
                    randLinks,
                    y
                );

                pdf.setTextColor(
                    32,
                    37,
                    43
                );

                pdf.text(
                    wert(
                        eintrag.stunden
                    ) + " Std.",
                    seitenBreite -
                    randRechts,
                    y,
                    {
                        align: "right"
                    }
                );

                y += 7;

                pdf.setFont(
                    "helvetica",
                    "normal"
                );

                pdf.setFontSize(9.5);

                const arbeiten =
                    pdf.splitTextToSize(
                        wert(
                            eintrag.arbeiten
                        ),
                        inhaltBreite
                    );

                pruefePlatz(
                    arbeiten.length *
                    5 +
                    10
                );

                pdf.text(
                    arbeiten,
                    randLinks,
                    y
                );

                y +=
                    arbeiten.length *
                    5 +
                    4;

                if (
                    eintrag.bemerkung
                ) {

                    pdf.setFont(
                        "helvetica",
                        "italic"
                    );

                    pdf.setTextColor(
                        90,
                        99,
                        110
                    );

                    const bemerkung =
                        pdf.splitTextToSize(
                            "Bemerkung: " +
                            wert(
                                eintrag.bemerkung
                            ),
                            inhaltBreite
                        );

                    pdf.text(
                        bemerkung,
                        randLinks,
                        y
                    );

                    y +=
                        bemerkung.length *
                        5 +
                        3;

                    pdf.setFont(
                        "helvetica",
                        "normal"
                    );

                    pdf.setTextColor(
                        32,
                        37,
                        43
                    );
                }

                y += 5;

                if (
                    index <
                    liste.length - 1
                ) {

                    pdf.setDrawColor(
                        220,
                        224,
                        230
                    );

                    pdf.line(
                        randLinks,
                        y - 3,
                        seitenBreite -
                        randRechts,
                        y - 3
                    );
                }

            }
        );
    }


    /* =====================================================
       Material
       ===================================================== */

    function zeichneMaterial() {

        abschnittTitel(
            "Material"
        );

        const liste =
            auftrag.material ||
            [];

        if (liste.length === 0) {

            pdf.setFont(
                "helvetica",
                "normal"
            );

            pdf.setFontSize(10);

            pdf.setTextColor(
                100,
                108,
                118
            );

            pdf.text(
                "Kein Material erfasst.",
                randLinks,
                y
            );

            y += 10;

            return;
        }

        pdf.setFillColor(
            234,
            242,
            252
        );

        pdf.rect(
            randLinks,
            y,
            inhaltBreite,
            9,
            "F"
        );

        pdf.setFont(
            "helvetica",
            "bold"
        );

        pdf.setFontSize(9.5);

        pdf.setTextColor(
            11,
            78,
            162
        );

        pdf.text(
            "Bezeichnung",
            randLinks + 3,
            y + 6
        );

        pdf.text(
            "Menge",
            140,
            y + 6
        );

        pdf.text(
            "Einheit",
            168,
            y + 6
        );

        y += 12;

        liste.forEach(
            function(position) {

                pruefePlatz(12);

                const bezeichnung =
                    pdf.splitTextToSize(
                        wert(
                            position.bezeichnung
                        ),
                        108
                    );

                const hoehe =
                    Math.max(
                        8,
                        bezeichnung.length *
                        5
                    );

                pdf.setFont(
                    "helvetica",
                    "normal"
                );

                pdf.setFontSize(9.5);

                pdf.setTextColor(
                    32,
                    37,
                    43
                );

                pdf.text(
                    bezeichnung,
                    randLinks + 3,
                    y
                );

                pdf.text(
                    wert(
                        position.menge
                    ),
                    140,
                    y
                );

                pdf.text(
                    wert(
                        position.einheit
                    ),
                    168,
                    y
                );

                y += hoehe;

                pdf.setDrawColor(
                    225,
                    228,
                    233
                );

                pdf.line(
                    randLinks,
                    y,
                    seitenBreite -
                    randRechts,
                    y
                );

                y += 4;

            }
        );

        y += 4;
    }


    /* =====================================================
       Fotos
       ===================================================== */

    async function zeichneFotos() {

        const fotos =
            auftrag.fotos ||
            [];

        if (fotos.length === 0) {
            return;
        }

        neueSeite();

        abschnittTitel(
            "Fotodokumentation"
        );

        for (
            let index = 0;
            index < fotos.length;
            index++
        ) {

            const foto =
                fotos[index];

            if (
                !foto ||
                !foto.bild
            ) {
                continue;
            }

            pruefePlatz(78);

            try {

                const bild =
                    await bildLaden(
                        foto.bild
                    );

                const maxBreite = 82;
                const maxHoehe = 60;

                let breite =
                    maxBreite;

                let hoehe =
                    bild.height *
                    breite /
                    bild.width;

                if (
                    hoehe >
                    maxHoehe
                ) {

                    hoehe =
                        maxHoehe;

                    breite =
                        bild.width *
                        hoehe /
                        bild.height;
                }

                pdf.addImage(
                    foto.bild,
                    bildFormat(
                        foto.bild
                    ),
                    randLinks,
                    y,
                    breite,
                    hoehe,
                    undefined,
                    "FAST"
                );

                pdf.setFont(
                    "helvetica",
                    "normal"
                );

                pdf.setFontSize(8.5);

                pdf.setTextColor(
                    90,
                    99,
                    110
                );

                pdf.text(
                    "Foto " +
                    (index + 1),
                    randLinks +
                    breite +
                    7,
                    y + 6
                );

                pdf.text(
                    wert(
                        foto.datum
                    ) +
                    " " +
                    wert(
                        foto.uhrzeit
                    ),
                    randLinks +
                    breite +
                    7,
                    y + 12
                );

                y +=
                    hoehe +
                    10;

            } catch (fehler) {

                console.warn(
                    "Foto konnte nicht geladen werden:",
                    fehler
                );

                pdf.setFontSize(9);

                pdf.setTextColor(
                    160,
                    40,
                    40
                );

                pdf.text(
                    "Foto " +
                    (index + 1) +
                    " konnte nicht dargestellt werden.",
                    randLinks,
                    y
                );

                y += 10;
            }

        }
    }


    /* =====================================================
       Unterschrift
       ===================================================== */

    function zeichneUnterschrift() {

        pruefePlatz(65);

        abschnittTitel(
            "Kundenbestätigung"
        );

        const unterschriften =
            auftrag.unterschriften ||
            [];

        if (
            unterschriften.length >
            0 &&
            unterschriften[0]
        ) {

            try {

                pdf.addImage(
                    unterschriften[0],
                    bildFormat(
                        unterschriften[0]
                    ),
                    randLinks,
                    y,
                    70,
                    30
                );

                y += 34;

            } catch (fehler) {

                console.warn(
                    "Unterschrift konnte nicht eingefügt werden:",
                    fehler
                );

                pdf.setFont(
                    "helvetica",
                    "normal"
                );

                pdf.setFontSize(9.5);

                pdf.setTextColor(
                    100,
                    108,
                    118
                );

                pdf.text(
                    "Unterschrift konnte nicht dargestellt werden.",
                    randLinks,
                    y
                );

                y += 12;
            }

        } else {

            pdf.setFont(
                "helvetica",
                "normal"
            );

            pdf.setFontSize(9.5);

            pdf.setTextColor(
                100,
                108,
                118
            );

            pdf.text(
                "Keine Kundenunterschrift vorhanden.",
                randLinks,
                y
            );

            y += 14;
        }

        pdf.setDrawColor(
            80,
            88,
            98
        );

        pdf.line(
            randLinks,
            y,
            randLinks + 75,
            y
        );

        y += 5;

        pdf.setFontSize(8.5);

        pdf.setTextColor(
            90,
            99,
            110
        );

        pdf.text(
            "Unterschrift Auftraggeber / Kunde",
            randLinks,
            y
        );

        y += 8;
    }


    /* =====================================================
       Fußzeilen
       ===================================================== */

    function zeichneFusszeilen() {

        const seitenAnzahl =
            pdf.getNumberOfPages();

        for (
            let seite = 1;
            seite <= seitenAnzahl;
            seite++
        ) {

            pdf.setPage(seite);

            pdf.setDrawColor(
                200,
                205,
                212
            );

            pdf.setLineWidth(0.25);

            pdf.line(
                randLinks,
                283,
                seitenBreite -
                randRechts,
                283
            );

            pdf.setFont(
                "helvetica",
                "normal"
            );

            pdf.setFontSize(8);

            pdf.setTextColor(
                95,
                103,
                112
            );

            pdf.text(
                "Raimo Fietz Elektrotechnik · Kneist 27 · 24147 Kiel",
                randLinks,
                289
            );

            pdf.text(
                "Seite " +
                seite +
                " von " +
                seitenAnzahl,
                seitenBreite -
                randRechts,
                289,
                {
                    align: "right"
                }
            );

        }
    }


    /* =====================================================
       PDF zusammenbauen
       ===================================================== */

    try {

        await zeichneFirmenkopf();

        zeichneAuftragsdaten();

        zeichneTaetigkeitsnachweise();

        zeichneRegieberichte();

        zeichneMaterial();

        await zeichneFotos();

        zeichneUnterschrift();

        zeichneFusszeilen();

        const nummer =
            dateinameBereinigen(
                auftrag.nummer
            ) ||
            "ohne_Nummer";

        const dateiname =
            "Auftrag_" +
            nummer +
            ".pdf";

        pdf.save(dateiname);

    } catch (fehler) {

        console.error(
            "PDF konnte nicht erstellt werden:",
            fehler
        );

        alert(
            "Beim Erstellen des PDFs ist ein Fehler aufgetreten. Bitte öffne die Browser-Konsole mit F12."
        );

    }

}