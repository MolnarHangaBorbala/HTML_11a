document.getElementById("parkingForm").addEventListener("submit", function (event) {
    event.preventDefault();

    const zona = document.getElementById("zona").value;
    const jarmuSzorzó = parseFloat(document.getElementById("jarmu").value);
    const ora = parseInt(document.getElementById("ora").value);
    const perc = parseInt(document.getElementById("perc").value);
    const berlet = document.getElementById("berlet").checked;

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

    osszeg *= jarmuSzorzó;
    if (berlet) osszeg *= 0.8;
    osszeg = Math.min(Math.round(osszeg), 15000);

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
        <h3>Parkolójegy</h3>
        <p><strong>Zóna:</strong> ${zona}</p>
        <p><strong>Jármű szorzó:</strong> ${jarmuSzorzó}</p>
        <p><strong>Időtartam:</strong> ${ora} óra ${perc} perc</p>
        <p><strong>Fizetendő összeg:</strong> ${osszeg} Ft</p>
    `;

    // Assemble
    ticket.appendChild(ticketText);
    ticketShadow.appendChild(ticket);
    ticketWrapper.appendChild(ticketShadow);
    printerBox.appendChild(ticketWrapper);

    // Animate the ticket
    ticket.style.animation = "none";
    void ticket.offsetWidth; // trigger reflow
    ticket.style.animation = "print 7s ease-out forwards";

    ticket.addEventListener("animationend", () => {
        // Set inline positions so dragging works
        const computedTop = parseFloat(window.getComputedStyle(ticketWrapper).top) || 0;
        const computedLeft = parseFloat(window.getComputedStyle(ticketWrapper).left) || 0;
        ticketWrapper.style.top = computedTop + "px";
        ticketWrapper.style.left = computedLeft + "px";

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

            const tilt = dx * 0.025;
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