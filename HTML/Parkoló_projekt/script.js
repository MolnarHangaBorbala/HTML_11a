document.getElementById("parkingForm").addEventListener("submit", function (event) {
    event.preventDefault();

    const zona = document.getElementById("zona").value;
    const jarmuSelect = document.getElementById("jarmu");
    const jarmuMultiplier = parseFloat(jarmuSelect.value);
    const jarmuText = jarmuSelect.options[jarmuSelect.selectedIndex].text;
    const rendszam = document.getElementById("plate").value;
    const ora = parseInt(document.getElementById("ora").value);
    const perc = parseInt(document.getElementById("perc").value);
    const berlet = document.getElementById("berlet").checked;
    const progressBar = document.getElementById("progress");
    const country = select.value;

    const zonaDijak = { "A": 1000, "B": 800, "C": 600 };
    let alapDij = zonaDijak[zona];
    let teljesOra = ora + (perc / 60);
    let osszeg = 0;
    let aktualisOraDij = alapDij;
    let maradekIdo = teljesOra;

    while (maradekIdo > 0) {
        if (maradekIdo >= 1) {
            osszeg += aktualisOraDij;
            maradekIdo -= 1;
        } else {
            osszeg += aktualisOraDij * maradekIdo;
            maradekIdo = 0;
        }
        aktualisOraDij *= 1.10;
    }

    osszeg *= jarmuMultiplier;
    if (berlet) osszeg *= 0.8;
    osszeg = Math.min(Math.round(osszeg), 9999);

    // Create a new ticket wrapper dynamically
    const printerBox = document.querySelector(".inner-printerbox .line");

    const ticketWrapper = document.createElement("div");
    ticketWrapper.className = "ticket-wrapper";

    const ticketShadow = document.createElement("div");
    ticketShadow.className = "ticket-shadow";

    const ticket = document.createElement("div");
    ticket.id = "ticket";
    ticket.className = "ticket";

    const ticketText = document.createElement("div");
    ticketText.className = "ticket-text";
    ticketText.innerHTML = `
        <h3>PARKOLÓJEGY</h3>
        <p><strong>Zóna:</strong> ${zona}</p>
        <p><strong>Jármű:</strong> ${jarmuText}</p>
        <p><strong>Időtartam:</strong> ${ora}ó ${perc}p</p>
        <p><strong>R.szám:</strong> ${country} ${rendszam}</p>
        <p><strong>Bérlet:</strong> ${berlet ? "Igen" : "Nem"}</p>
        <p id="ticket-cost"><strong>Fizetendő:</strong> <span id="ticket-cost-value">${osszeg} Ft</span></p>
        <div class="ticket-images">
            <img src="barcode-icon.png" alt="barcode icon" class="barcode-icon">
            <img src="sign.png" alt="parking icon" class="ticket-icon">
        </div>
    `;

    // Assemble
    ticket.appendChild(ticketText);
    ticketShadow.appendChild(ticket);
    ticketWrapper.appendChild(ticketShadow);
    printerBox.appendChild(ticketWrapper);

    // Animate the ticket and progress bar
    progressBar.style.animation = "none";
    ticket.style.animation = "none";
    void ticket.offsetWidth; // trigger reflow
    void progressBar.offsetWidth; // trigger reflow
    ticket.style.animation = "print 7s ease-out forwards";
    progressBar.style.animation = "printProgress 7s ease-out forwards";
    document.documentElement.classList.add("busy");

    ticket.addEventListener("animationend", () => {
        // Set inline positions so dragging works
        const computedTop = parseFloat(window.getComputedStyle(ticketWrapper).top) || 0;
        const computedLeft = parseFloat(window.getComputedStyle(ticketWrapper).left) || 0;
        ticketWrapper.style.top = computedTop + "px";
        ticketWrapper.style.left = computedLeft + "px";
        document.documentElement.classList.remove("busy");
        progressBar.style.animation = "none";
        // Enable dragging for this ticket
        dragElement(ticketWrapper);
    }, { once: true });

    function dragElement(elmnt) {
        let startX = 0, startY = 0, origX = 0, origY = 0;

        elmnt.onmousedown = function (e) {
            e.preventDefault();
            elmnt.classList.add("dragging");

            startX = e.clientX;
            startY = e.clientY;
            origX = parseFloat(elmnt.style.left) || 0;
            origY = parseFloat(elmnt.style.top) || 0;

            document.onmouseup = closeDragElement;
            document.onmousemove = elementDrag;
        };

        function handleTrashCollision(elmnt) {
            const trash = document.querySelector(".trash-box");

            const ticketRect = elmnt.getBoundingClientRect();
            const trashRect = trash.getBoundingClientRect();

            const ticketCenterX = ticketRect.left + ticketRect.width / 2;
            const ticketCenterY = ticketRect.top + ticketRect.height / 2;

            const trashCenterX = trashRect.left + trashRect.width / 2;
            const trashCenterY = trashRect.top + trashRect.height / 2;

            const distance = Math.hypot(
                ticketCenterX - trashCenterX,
                ticketCenterY - trashCenterY
            );

            const snapDistance = 100; // increase if needed

            if (distance < snapDistance) {
                trash.classList.add("active");
            } else {
                trash.classList.remove("active");
            }
        }

        function elementDrag(e) {
            e.preventDefault();

            const dx = e.clientX - startX;
            const dy = e.clientY - startY;

            const newX = origX + dx;
            const newY = origY + dy;

            elmnt.style.left = newX + "px";
            elmnt.style.top = newY + "px";

            const tilt = dx * 0.010;
            elmnt.style.transform = `rotate(${tilt}deg)`;

            handleTrashCollision(elmnt);
        }

        function closeDragElement() {
            document.onmouseup = null;
            document.onmousemove = null;
            elmnt.classList.remove("dragging");
            elmnt.style.transform = "rotate(0deg)";

            const trash = document.querySelector(".trash-box");
            trash.classList.remove("active");

            const ticketRect = elmnt.getBoundingClientRect();
            const trashRect = trash.getBoundingClientRect();

            const isOverlapping =
                ticketRect.left < trashRect.right &&
                ticketRect.right > trashRect.left &&
                ticketRect.top < trashRect.bottom &&
                ticketRect.bottom > trashRect.top;

            if (isOverlapping) {
                elmnt.classList.add("deleting");
                setTimeout(() => elmnt.remove(), 300);
            }
        }
    }
});

const countries = [
    { code: "HU", name: "Hungary" },
    { code: "DE", name: "Germany" },
    { code: "FR", name: "France" },
    { code: "IT", name: "Italy" },
    { code: "US", name: "United States" },
    { code: "GB", name: "United Kingdom" },
    { code: "RS", name: "Serbia" },
    { code: "UA", name: "Ukraine" }
];

const select = document.getElementById("country");

countries.forEach(country => {
    const option = document.createElement("option");
    option.value = country.code;
    option.textContent = country.code;
    option.title = country.name;

    select.appendChild(option);
});

const platePatterns = {
    HU: [
        /^[A-Z]{3}-?\d{3}$/,
        /^[A-Z]{2}-?[A-Z]{2}-?\d{3}$/
    ],
    DE: [/^[A-Z]{1,3}-[A-Z]{1,2}\s?\d{1,4}$/],
    FR: [/^[A-Z]{2}-?\d{3}-?[A-Z]{2}$/],
    IT: [/^[A-Z]{2}\d{3}[A-Z]{2}$/],
    US: [/^[A-Z0-9]{5,8}$/],
    GB: [/^[A-Z]{2}\d{2}\s?[A-Z]{3}$/],
    RS: [/^[A-Z]{2}-?\d{3}-?[A-Z]{2}$/],
    UA: [/^[A-Z]{2}\d{4}[A-Z]{2}$/]
};

const plateInput = document.getElementById("plate");
const errorDiv = document.getElementById("error");

plateInput.addEventListener("input", () => {
    const country = select.value;
    const value = plateInput.value.toUpperCase();

    plateInput.value = value;

    const patterns = platePatterns[country];
    if (!patterns) return;

    const isValid = patterns.some(pattern => pattern.test(value));

    if (!isValid) {
        errorDiv.textContent = "❌";
    } else {
        errorDiv.textContent = "";
    }
});

select.addEventListener("change", () => {
    const placeholders = {
        HU: "ABC-123 , AB-CD-123",
        DE: "A-BC 1234",
        FR: "AB-123-CD",
        IT: "AB123CD",
        US: "1ABC234",
        GB: "AB12 CDE",
        RS: "AB-123-CD",
        UA: "AB1234CD"
    };

    plateInput.placeholder = placeholders[select.value] || "";
});