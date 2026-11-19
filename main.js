const SERVER_IP = "tierprac.xyz";
const STATUS_URL = "https://api.mcsrvstat.us/3/tierprac.xyz";
const DISCORD_INVITE_URL = "https://discord.com/api/v10/invites/tierprac?with_counts=true";

const copyButton = document.getElementById("copy-ip");
const modalCopyButton = document.getElementById("modal-copy-ip");
const playButton = document.getElementById("play-now");
const modal = document.getElementById("join-modal");
const closeModalButton = document.getElementById("close-modal");
const serverStatus = document.getElementById("server-status");
const statusDot = document.querySelector(".status-dot");
const discordMembers = document.getElementById("discord-members");
const kitCount = document.getElementById("kit-count");
const kitSearchInput = document.getElementById("kit-search-input");
const kitNoResults = document.getElementById("kit-no-results");

async function copyIP(button) {
    try {
        if (navigator.clipboard?.writeText) {
            await navigator.clipboard.writeText(SERVER_IP);
        } else {
            const input = document.createElement("textarea");
            input.value = SERVER_IP;
            input.setAttribute("readonly", "");
            input.style.position = "fixed";
            input.style.opacity = "0";
            document.body.appendChild(input);
            input.select();
            const copied = document.execCommand("copy");
            input.remove();
            if (!copied) {
                throw new Error("Copy command was not successful.");
            }
        }

        const originalText = button.textContent;
        button.textContent = "Copied!";
        window.setTimeout(() => {
            button.textContent = originalText;
        }, 2000);
    } catch (error) {
        console.error("Could not copy the server IP:", error);
        button.textContent = "Copy failed";
        window.setTimeout(() => {
            button.textContent = "Copy Server IP";
        }, 2000);
    }
}

function openModal() {
    modal.hidden = false;
    document.body.classList.add("modal-open");
    closeModalButton.focus();
}

function closeModal() {
    modal.hidden = true;
    document.body.classList.remove("modal-open");
    playButton.focus();
}

async function updateServerStatus() {
    try {
        const response = await fetch(STATUS_URL);
        if (!response.ok) {
            throw new Error(`Status API returned ${response.status}.`);
        }

        const server = await response.json();
        if (!server.online) {
            throw new Error("The server is offline.");
        }

        const players = server.players?.online ?? 0;
        serverStatus.textContent = `${players} player${players === 1 ? "" : "s"} online`;
        statusDot.classList.add("online");
        statusDot.classList.remove("offline");
    } catch (error) {
        console.error("Could not load server status:", error);
        serverStatus.textContent = "Server status unavailable";
        statusDot.classList.add("offline");
        statusDot.classList.remove("online");
    }
}

async function updateDiscordMembers() {
    try {
        const response = await fetch(DISCORD_INVITE_URL);
        if (!response.ok) {
            throw new Error(`Discord API returned ${response.status}.`);
        }

        const invite = await response.json();
        const members = invite.approximate_member_count;
        if (typeof members !== "number") {
            throw new Error("Discord invite did not include a member count.");
        }

        discordMembers.textContent = members.toLocaleString();
    } catch (error) {
        console.error("Could not load Discord member count:", error);
        discordMembers.textContent = "—";
    }
}

function updateKitCount() {
    const kits = document.querySelectorAll("#kits .kit-item");
    kitCount.textContent = kits.length.toString();
    kits.forEach((kit, index) => {
        const number = kit.querySelector(".kit-number");
        number.textContent = String(index + 1).padStart(2, "0");
    });
}

function filterKits() {
    const query = kitSearchInput.value.trim().toLowerCase();
    let visibleKits = 0;

    document.querySelectorAll("#kits .kit-group").forEach((group) => {
        let visibleInGroup = 0;
        group.querySelectorAll(".kit-item").forEach((kit) => {
            const name = kit.querySelector(".kit-name").textContent.toLowerCase();
            const isVisible = !query || name.includes(query);
            kit.hidden = !isVisible;
            visibleInGroup += isVisible ? 1 : 0;
            visibleKits += isVisible ? 1 : 0;
        });
        group.hidden = visibleInGroup === 0;
    });

    kitNoResults.hidden = visibleKits > 0;
}

playButton.addEventListener("click", openModal);
closeModalButton.addEventListener("click", closeModal);
copyButton.addEventListener("click", () => copyIP(copyButton));
modalCopyButton.addEventListener("click", () => copyIP(modalCopyButton));

modal.addEventListener("click", (event) => {
    if (event.target === modal) {
        closeModal();
    }
});

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !modal.hidden) {
        closeModal();
    }
});

updateServerStatus();
updateDiscordMembers();
updateKitCount();
kitSearchInput.addEventListener("input", filterKits);
window.setInterval(updateServerStatus, 60000);
window.setInterval(updateDiscordMembers, 300000);
