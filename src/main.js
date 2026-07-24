import { Router } from './router.js';
import { createNavbar, updateActiveLink } from './components/navbar.js';
import { renderHome } from './views/home.js';
import { renderDiscover } from './views/discover.js';
import { renderMovie } from './views/movie.js';
import { renderWatchlist } from './views/watchlist.js';
import { renderActor } from './views/actor.js';
import { getMovieVideos } from './api/tmdb.js';
import { displayMessage } from './components/toast.js';

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

    // 5. Custom Event Listeners
    document.addEventListener('watchTrailer', async (e) => {
        const movieId = e.detail.movieId;
        try {
            const data = await getMovieVideos(movieId);
            const t = data.results.find(v => v.site === "YouTube" && v.type === "Trailer");
            if (t) {
                window.open(`https://www.youtube.com/watch?v=${t.key}`, "_blank");
            } else {
                displayMessage("Trailer not available", "error");
            }
        } catch (err) {
            console.error("Failed to load trailer:", err);
            displayMessage("Failed to load trailer", "error");
        }
    });
});
