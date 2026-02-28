document.getElementById("parkingForm").addEventListener("submit", function (event) {
    event.preventDefault();

    // --- Get form values ---
    const zona = document.getElementById("zona").value;
    const jarmuSelect = document.getElementById("jarmu");
    const jarmuMultiplier = parseFloat(jarmuSelect.value);
    const jarmuText = jarmuSelect.options[jarmuSelect.selectedIndex].text;
    const rendszam = document.getElementById("plate").value;
    const ora = parseInt(document.getElementById("ora").value);
    const perc = parseInt(document.getElementById("perc").value);
    const berlet = document.getElementById("berlet").checked;
    const progressBar = document.getElementById("progress");
    const country = document.getElementById("country").value;

    const errorDiv = document.getElementById("error");
    if (errorDiv.textContent === "❌") {
        alert("Hibás rendszám!");
        return;
    }

    if (ora === 0 && perc === 0) {
        alert("Adj meg parkolási időt!");
        return;
    }

    // --- Progressive pricing ---
    const zonaDijak = { "A": 1000, "B": 800, "C": 600 };
    let alapDij = zonaDijak[zona];
    let teljesOra = ora + perc / 60;
    let osszeg = 0;
    let aktualisOraDij = alapDij;
    let maradekIdo = teljesOra;

    while (maradekIdo > 0) {
        let fizetettOra = Math.min(maradekIdo, 1);
        osszeg += aktualisOraDij * fizetettOra;
        maradekIdo -= fizetettOra;
        aktualisOraDij *= 1.10;
    }

    osszeg *= jarmuMultiplier;
    if (berlet) osszeg *= 0.8;
    osszeg = Math.min(Math.round(osszeg), 9999);

    // --- Generate dynamic date ---
    const now = new Date();
    const formattedDate = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')} - ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    // --- Build ticket ---
    const printerBox = document.querySelector(".inner-printerbox .line");

    const ticketWrapper = document.createElement("div");
    ticketWrapper.className = "ticket-wrapper";

    const ticketShadow = document.createElement("div");
    ticketShadow.className = "ticket-shadow";

    const ticket = document.createElement("div");
    ticket.className = "ticket";

    const ticketText = document.createElement("div");
    ticketText.className = "ticket-text";
    // Generate random ticket number
    function generateRandomTicketNumber(length = 11) {
        let numbers = [];
        for (let i = 0; i < length; i++) {
            numbers.push(Math.floor(Math.random() * 10));
        }
        return numbers.join(' ');
    }

    const ticketNumber = generateRandomTicketNumber();
    ticketText.innerHTML = `
    <h3>PARKOLÓJEGY</h3>
    <p><strong>Zóna:</strong> ${zona}</p>
    <p><strong>Jármű:</strong> ${jarmuText}</p>
    <p><strong>Időtartam:</strong> ${ora}ó ${perc}p</p>
    <p><strong>R.szám:</strong> ${country} ${rendszam}</p>
    <p><strong>Bérlet:</strong> ${berlet ? "Igen" : "Nem"}</p>
    <p id="ticket-cost"><strong>Fizetendő:</strong> <span class="ticket-cost-value">${osszeg} Ft</span></p>
    <div class="ticket-date">
        <p>Dátum: <span class="ticket-date-value">${formattedDate}</span></p>
    </div>
    <div class="ticket-number">
        <p><span class="ticket-number-value">${ticketNumber}</span></p>
    </div>
    <div class="ticket-images">
        <img src="barcode-icon.png" alt="barcode icon" class="barcode-icon">
        <img src="sign.png" alt="parking icon" class="ticket-icon">
    </div>
`;

    // --- Assemble ticket ---
    ticket.appendChild(ticketText);
    ticketShadow.appendChild(ticket);
    ticketWrapper.appendChild(ticketShadow);
    printerBox.appendChild(ticketWrapper);

    // --- Animate ticket and progress bar ---
    progressBar.style.animation = "none";
    ticket.style.animation = "none";
    void ticket.offsetWidth;
    void progressBar.offsetWidth;
    ticket.style.animation = "print 7s ease-out forwards";
    progressBar.style.animation = "printProgress 7s ease-out forwards";
    document.documentElement.classList.add("busy");

    ticket.addEventListener("animationend", () => {
        const computedTop = parseFloat(window.getComputedStyle(ticketWrapper).top) || 0;
        const computedLeft = parseFloat(window.getComputedStyle(ticketWrapper).left) || 0;
        ticketWrapper.style.top = computedTop + "px";
        ticketWrapper.style.left = computedLeft + "px";
        document.documentElement.classList.remove("busy");
        progressBar.style.animation = "none";
        dragElement(ticketWrapper);
    }, { once: true });

    // --- Drag & trash logic ---
    function dragElement(elmnt) {
        let startX = 0, startY = 0, origX = 0, origY = 0;

        elmnt.onmousedown = function (e) {
            e.preventDefault();
            elmnt.classList.add("dragging");
            startX = e.clientX; startY = e.clientY;
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
            const distance = Math.hypot(ticketCenterX - trashCenterX, ticketCenterY - trashCenterY);
            trash.classList.toggle("active", distance < 100);
        }

        function elementDrag(e) {
            e.preventDefault();
            const dx = e.clientX - startX, dy = e.clientY - startY;
            elmnt.style.left = (origX + dx) + "px";
            elmnt.style.top = (origY + dy) + "px";
            elmnt.style.transform = `rotate(${dx * 0.01}deg)`;
            handleTrashCollision(elmnt);
        }

        function closeDragElement() {
            document.onmouseup = null; document.onmousemove = null;
            elmnt.classList.remove("dragging"); elmnt.style.transform = "rotate(0deg)";
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