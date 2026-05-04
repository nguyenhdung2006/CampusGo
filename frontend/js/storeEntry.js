import { renderNavbar, setupNotificationPopover } from "./components/navbar.js";
import { setupAddressPopover } from "./components/addressPopover.js";
import { setupProfilePopover } from "./components/profilePopover.js";
import { getCurrentUser, logoutApi } from "./services/userService.js";
import { setupLogin } from "./features/auth/login.js";
import { setupStoreOrders } from "./features/store/storeOrders.js";

// mount store view
async function loadStoreView() {
    const mount = document.getElementById("dynamic-views");
    const res = await fetch("./views/storeView.html", { cache: "no-store", credentials: "include" });
    if (!res.ok) throw new Error("Cannot load storeView.html: " + res.status);
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
        // Không login thì quay về index (ở đó có form login)
        location.href = "./index.html";
        return;
    }

    const storeView = document.getElementById("store-view");
    const storeNavbarRoot = document.getElementById("store-navbar-root");
    if (!storeView) throw new Error("store-view not found in storeView.html");

    // show store view
    document.querySelectorAll(".page").forEach((v) => v.classList.remove("page--active"));
    storeView.classList.add("page--active");

    renderViewNavbar(storeNavbarRoot, me);

    setupStoreOrders({
        onBackHome: () => (location.href = "./index.html"),
    });
}

(async function bootstrap() {
    try {
        await loadStoreView();
        await ensureLoginThenStart();
    } catch (e) {
        document.body.innerHTML = `<pre style="padding:16px;color:#b91c1c;">${e.stack || e}</pre>`;
        console.error(e);
    }
})();
