import { renderNavbar } from "./components/navbar.js";
import { setupLogin } from "./features/auth/login.js";
import { setupHome } from "./features/home/home.js";
import { setupFood } from "./features/food/foodList.js";
import { clearUser, getUser } from "./utils/storage.js";

const loginView = document.getElementById("login-view");
const homeView = document.getElementById("home-view");
const foodView = document.getElementById("food-view");

const navbarRoot = document.getElementById("navbar-root");
const foodNavbarRoot = document.getElementById("food-navbar-root");

let currentUser = null;

function hideAllViews() {
    [loginView, homeView, foodView].forEach((view) => view.classList.remove("page--active"));
}

function bindLogoutButton() {
    const logoutButtons = document.querySelectorAll("#logout-btn");
    logoutButtons.forEach((btn) => {
        btn.addEventListener("click", () => {
            clearUser();
            currentUser = null;
            showLogin();
        });
    });
}

function showLogin() {
    hideAllViews();
    loginView.classList.add("page--active");
}

function showHome(user) {
    currentUser = user;
    hideAllViews();
    homeView.classList.add("page--active");

    navbarRoot.innerHTML = renderNavbar(user);
    bindLogoutButton();

    setupHome(user, {
        onOpenFood: () => showFood(user),
    });
}

function showFood(user) {
    hideAllViews();
    foodView.classList.add("page--active");

    foodNavbarRoot.innerHTML = renderNavbar(user);
    bindLogoutButton();

    setupFood({
        user,
        onBackHome: () => showHome(user),
    });
}

setupLogin({
    onSuccess: (user) => {
        showHome(user);
    },
});

const savedUser = getUser();
if (savedUser) {
    showHome(savedUser);
} else {
    showLogin();
}