import { renderNavbar } from "./components/navbar.js";
import { setupAddressPopover } from "./components/addressPopover.js";
import { setupLogin } from "./features/auth/login.js";
import { setupFood } from "./features/food/foodList.js";
import { setupHome } from "./features/home/home.js";
import { loadMarketplaceDetail, loadMarketplaceList, setupMarketplace } from "./features/marketplace/listItems.js";
import { getCurrentUser, logoutApi } from "./services/userService.js";
import { clearUser, getUser, saveUser } from "./utils/storage.js";
import { setupStoreOrders } from "./features/store/storeOrders.js";

const loginView = document.getElementById("login-view");
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

    const res = await fetch("./views/storeView.html", { cache: "no-store" });
    if (res.ok) {
        mount.insertAdjacentHTML("beforeend", await res.text());
    } else {
        console.warn("Cannot load storeView.html", res.status);
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
    setupAddressPopover(root);
}

function showLogin() {
    hideAllViews();
    loginView.classList.add("page--active");
}

function showHome(user) {
    currentUser = user;

    if (user?.role === "STORE") {
        showStore(user);
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

(async function bootstrap() {
    await loadDynamicViews();
    const me = await getCurrentUser();

    if (me) {
        saveUser(me);
        showHome(me);
        return;
    }

    const savedUser = getUser();
    if (savedUser) showHome(savedUser);
    else showLogin();
})();
