import { renderNavbar, setupNotificationPopover } from "./components/navbar.js";
import { setupAddressPopover } from "./components/addressPopover.js";
import { setupProfilePopover } from "./components/profilePopover.js";
import { getCurrentUser, logoutApi } from "./services/userService.js";
import { setupShipperDeliveries } from "./features/shipper/shipperDeliveries.js";

async function loadShipperView() {
    const mount = document.getElementById("dynamic-views");
    const res = await fetch("./views/shipperView.html", { cache: "no-store", credentials: "include" });
    if (!res.ok) throw new Error("Cannot load shipperView.html: " + res.status);
    mount.innerHTML = await res.text();
}

function bindLogoutButton() {
    document.querySelectorAll("#logout-btn").forEach((btn) => {
        btn.onclick = async () => {
        await logoutApi();
        location.href = "./index.html";
        };
    });
}

function renderViewNavbar(root, user) {
    if (!root) return;
    root.innerHTML = renderNavbar(user);
    bindLogoutButton();
    setupNotificationPopover(root, user);
    setupProfilePopover(root, user, {
        onUserUpdated: (updatedUser) => renderViewNavbar(root, updatedUser),
    });
    setupAddressPopover(root);
}

async function ensureLoginThenStart() {
    const me = await getCurrentUser();
    if (!me) {
        location.href = "./index.html";
        return;
    }

    const shipperView = document.getElementById("shipper-view");
    const shipperNavbarRoot = document.getElementById("shipper-navbar-root");
    if (!shipperView) throw new Error("shipper-view not found in shipperView.html");

    document.querySelectorAll(".page").forEach((v) => v.classList.remove("page--active"));
    shipperView.classList.add("page--active");

    renderViewNavbar(shipperNavbarRoot, me);

    setupShipperDeliveries({
        onBackHome: () => (location.href = "./index.html"),
    });
}

(async function bootstrap() {
    try {
        await loadShipperView();
        await ensureLoginThenStart();
    } catch (e) {
        document.body.innerHTML = `<pre style="padding:16px;color:#b91c1c;">${e.stack || e}</pre>`;
        console.error(e);
    }
})();
