import { CONFIG, GENRE_MAP } from '../config.js';
import { discoverMovies } from '../api/tmdb.js';
import { openModal } from './modal.js';

export async function setupCarousels() {
    await createCarousel("carousel-scifi", "👽 Sci-Fi Hits", GENRE_MAP.sci_fi);
    await createCarousel("carousel-action", "💥 Action Packed", GENRE_MAP.action);
    await createCarousel("carousel-drama", "🎭 Top Dramas", GENRE_MAP.drama);
}

export async function createCarousel(title, category) {
    const container = document.getElementById("carouselsContainer");
    if (!container) return;

    try {
        let data;
        if (category === "trending") {
            const { fetchTrendingMovies } = await import('../api/tmdb.js');
            data = await fetchTrendingMovies();
        } else if (category === "top_rated") {
            // We don't have a top rated API yet, let's use discover with sort
            const { discoverMovies } = await import('../api/tmdb.js');
            data = await discoverMovies({ sort_by: 'vote_average.desc', 'vote_count.gte': 200 });
        } else {
            const { discoverMovies } = await import('../api/tmdb.js');
            data = await discoverMovies({ genre: category });
        }

        const movies = data.results;
        if (!movies || movies.length === 0) return;

        const section = document.createElement("div");
        section.className = "carousel-section";
        section.innerHTML = `<h3>${title}</h3>`;

        const row = document.createElement("div");
        row.className = "horizontal-carousel";

        movies.forEach(movie => {
            const card = document.createElement("div");
            card.className = "carousel-card";
            card.onclick = () => {
                window.location.hash = `#/movie/${movie.id}`;
            };

            const poster = movie.poster_path
                ? `${CONFIG.imageBaseUrl}/w200${movie.poster_path}`
                : "https://via.placeholder.com/150x225?text=No+Image";

            card.innerHTML = `
        <img src="${poster}" alt="${movie.title}">
        <h4>${movie.title}</h4>
      `;
            row.appendChild(card);
        });

        section.appendChild(row);
        container.appendChild(section);
    } catch (e) {
        console.error(`Error loading carousel ${title}:`, e);
    }
}

export function toggleCarousels(show) {
    const carousels = document.querySelectorAll(".carousel-section");
    carousels.forEach(c => c.style.display = show ? "block" : "none");
}
