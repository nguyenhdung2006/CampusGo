import { renderNavbar, setupNotificationPopover } from "./components/navbar.js";
import { setupAddressPopover } from "./components/addressPopover.js";
import { setupProfilePopover } from "./components/profilePopover.js";
import { setupLogin } from "./features/auth/login.js";
import { setupRegister } from "./features/auth/register.js";
import { setupFood } from "./features/food/foodList.js";
import { setupHome } from "./features/home/home.js";
import { loadMarketplaceDetail, loadMarketplaceList, setupMarketplace } from "./features/marketplace/listItems.js";
import { getCurrentUser, logoutApi } from "./services/userService.js";
import { clearUser, getUser, saveUser } from "./utils/storage.js";
import { setupStoreOrders } from "./features/store/storeOrders.js";
import { setupShipperDeliveries } from "./features/shipper/shipperDeliveries.js";

const loginView = document.getElementById("login-view");
const registerView = document.getElementById("register-view");
const homeView = document.getElementById("home-view");
const foodView = document.getElementById("food-view");
const marketplaceView = document.getElementById("marketplace-view");
const marketplaceDetailView = document.getElementById("marketplace-detail-view");
const marketplaceCreateView = document.getElementById("marketplace-create-view");

const navbarRoot = document.getElementById("navbar-root");
const foodNavbarRoot = document.getElementById("food-navbar-root");
const marketplaceNavbarRoot = document.getElementById("marketplace-navbar-root");
const marketplaceDetailNavbarRoot = document.getElementById("marketplace-detail-navbar-root");
const marketplaceCreateNavbarRoot = document.getElementById("marketplace-create-navbar-root");

let currentUser = null;
let foodSetupDone = false;

async function loadDynamicViews() {
    const mount = document.getElementById("dynamic-views");
    if (!mount) return;

    const files = ["./views/storeView.html", "./views/shipperView.html"];

    for (const f of files) {
        const res = await fetch(f, { cache: "no-store", credentials: "include" });
        if (res.ok) {
            mount.insertAdjacentHTML("beforeend", await res.text());
        } else {
            console.warn(`Cannot load ${f}`, res.status);
        }
    }
}

function hideAllViews() {
    document.querySelectorAll(".page").forEach((view) => {
        view.classList.remove("page--active");
        view.style.display = "";
    });
}

function bindLogoutButton() {
    document.querySelectorAll("#logout-btn").forEach((btn) => {
        btn.onclick = async () => {
            await logoutApi();
            clearUser();
            currentUser = null;
            foodSetupDone = false;
            showLogin();
        };
    });
}

function renderViewNavbar(root, user) {
    if (!root) return;
    root.innerHTML = renderNavbar(user);
    bindLogoutButton();
    setupNotificationPopover(root, user);
    setupProfilePopover(root, user, {
        onUserUpdated: (updatedUser, meta = {}) => {
            currentUser = updatedUser;
            saveUser(updatedUser);
            renderViewNavbar(root, updatedUser);
            if (meta.openProfile) {
                document.getElementById("profile-toggle-btn")?.click();
            }
        },
    });
    setupAddressPopover(root);
}

function showLogin() {
    hideAllViews();
    loginView.classList.add("page--active");
}

function showRegister() {
    hideAllViews();
    registerView.classList.add("page--active");
    document.getElementById("register-name")?.focus();
}

function showHome(user) {
    currentUser = user;

    if (user?.role === "STORE") {
        showStore(user);
        return;
    }

    if (user?.role === "SHIPPER") {
        showShipper(user);
        return;
    }

    hideAllViews();
    homeView.classList.add("page--active");

    renderViewNavbar(navbarRoot, user);

    setupHome(user, {
        onOpenFood: () => showFood(user),
        onOpenMarketplace: () => showMarketplace(user),
    });
}

let cleanupStore = null;
let cleanupShipper = null;

function showShipper(user) {
    const shipperView = document.getElementById("shipper-view");
    const shipperNavbarRoot = document.getElementById("shipper-navbar-root");

    if (!shipperView) {
        alert("Shipper view chưa được load. Kiểm tra dynamic-views và views/shipperView.html");
        return;
    }

    currentUser = user;
    hideAllViews();
    shipperView.classList.add("page--active");

    renderViewNavbar(shipperNavbarRoot, user);

    if (cleanupShipper) cleanupShipper();
    cleanupShipper = setupShipperDeliveries({
        onBackHome: () => showHome(user),
    });
}

function showStore(user) {
    const storeView = document.getElementById("store-view");
    const storeNavbarRoot = document.getElementById("store-navbar-root");

    if (!storeView) {
        alert("Store view chưa được load. Kiểm tra dynamic-views và views/storeView.html");
        return;
    }

    currentUser = user;
    hideAllViews();
    storeView.classList.add("page--active");

    renderViewNavbar(storeNavbarRoot, user);

    if (cleanupStore) cleanupStore();
    cleanupStore = setupStoreOrders({
        onBackHome: () => showHome(user),
    });
}

function showFood(user) {
    currentUser = user;
    hideAllViews();
    foodView.classList.add("page--active");

    renderViewNavbar(foodNavbarRoot, user);

    if (!foodSetupDone) {
        setupFood({
            user,
            onBackHome: () => showHome(user),
        });
        foodSetupDone = true;
    }
}

async function showMarketplace(user) {
    currentUser = user;
    hideAllViews();
    marketplaceView.classList.add("page--active");

    renderViewNavbar(marketplaceNavbarRoot, user);
    setupMarketplace({
        user,
        onBackHome: () => showHome(user),
        onOpenList: () => showMarketplace(user),
        onOpenCreate: () => showMarketplaceCreate(user),
        onOpenDetail: (id) => showMarketplaceDetail(user, id),
    });

    await loadMarketplaceList();
}

function showMarketplaceCreate(user) {
    currentUser = user;
    hideAllViews();
    marketplaceCreateView.classList.add("page--active");
    renderViewNavbar(marketplaceCreateNavbarRoot, user);
}

async function showMarketplaceDetail(user, itemId) {
    if (!itemId) {
        await showMarketplace(user);
        return;
    }

    currentUser = user;
    hideAllViews();
    marketplaceDetailView.classList.add("page--active");
    renderViewNavbar(marketplaceDetailNavbarRoot, user);
    await loadMarketplaceDetail(itemId);
}

setupLogin({
    onSuccess: (user) => showHome(user),
});

setupRegister({
    onSuccess: (user) => showHome(user),
    onOpenRegister: () => showRegister(),
    onBackLogin: () => showLogin(),
});

(async function bootstrap() {
    await loadDynamicViews();
    const me = await getCurrentUser();

    if (me) {
        saveUser(me);
        showHome(me);
        return;
    }

    const savedUser = getUser();
    if (savedUser) {
        clearUser();
    }
    showLogin();
})();
