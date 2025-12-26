import { Router } from './router.js';
import { createNavbar, updateActiveLink } from './components/navbar.js';
import { renderHome } from './views/home.js';
import { renderDiscover } from './views/discover.js';
import { renderMovie } from './views/movie.js';
import { renderWatchlist } from './views/watchlist.js';
import { renderActor } from './views/actor.js';

// --- INITIALIZATION ---
document.addEventListener("DOMContentLoaded", () => {
    // 1. Inject Navbar
    const body = document.body;
    const nav = createNavbar();
    body.insertBefore(nav, body.firstChild);

    // 2. Setup Routes
    const routes = {
        "/": renderHome,
        "/discover": renderDiscover,
        "/movie/:id": renderMovie,
        "/watchlist": renderWatchlist,
        "/actor/:id": renderActor
    };

    // 3. Initialize Router
    const router = new Router(routes);

    // 4. Global Listeners
    window.addEventListener("hashchange", updateActiveLink);
    updateActiveLink(); // Initial check
});
