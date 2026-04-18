import { renderNavbar } from "./components/navbar.js";
import { setupLogin } from "./features/auth/login.js";
import { setupHome } from "./features/home/home.js";
import { clearUser, getUser } from "./utils/storage.js";

const loginView = document.getElementById("login-view");
const homeView = document.getElementById("home-view");
const navbarRoot = document.getElementById("navbar-root");

function showLogin() {
    loginView.classList.add("page--active");
    homeView.classList.remove("page--active");
}

function showHome(user) {
    navbarRoot.innerHTML = renderNavbar(user);
    loginView.classList.remove("page--active");
    homeView.classList.add("page--active");
    setupHome(user);

    const logoutButton = document.getElementById("logout-btn");
    logoutButton?.addEventListener("click", () => {
        clearUser();
        showLogin();
    });
}

setupLogin({
    onSuccess: (user) => {
        showHome(user);
    },
});

const currentUser = getUser();

if (currentUser) {
    showHome(currentUser);
} else {
    showLogin();
}
