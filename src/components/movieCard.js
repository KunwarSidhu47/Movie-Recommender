import { CONFIG } from '../config.js';
import { openModal } from './modal.js';
import { state } from '../state.js';
import { getRottenTomatoesRating } from '../api/tmdb.js';

export function createMovieCard(movie) {
    const movieDiv = document.createElement("div");
    movieDiv.className = "movie";
    movieDiv.onclick = () => {
        window.location.hash = `#/movie/${movie.id}`;
    };

    // 3D Tilt Effect Logic
    movieDiv.addEventListener('mousemove', (e) => {
        const rect = movieDiv.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = ((y - centerY) / centerY) * -5;
        const rotateY = ((x - centerX) / centerX) * 5;

        movieDiv.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
    });

    movieDiv.addEventListener('mouseleave', () => {
        movieDiv.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
    });

    const poster = movie.poster_path
        ? `${CONFIG.imageBaseUrl}/w500${movie.poster_path}`
        : "https://via.placeholder.com/150x220?text=No+Image";

    const releaseYear = movie.release_date ? movie.release_date.slice(0, 4) : "N/A";
    const voteAverage = movie.vote_average ? movie.vote_average.toFixed(1) : "N/A";

    movieDiv.innerHTML = `
    <img src="${poster}" alt="${movie.title}" />
    <h4>${movie.title}</h4>
    <div class="movie-meta">
      <span class="release-year">${releaseYear}</span>
      <span class="vote-average">⭐ ${voteAverage}</span>
    </div>
    <div class="rating-info" id="rt-${movie.id}">🍅 RT: ${movie.rtRating || 'Loading...'}</div>
    <button class="details-btn" style="background: linear-gradient(135deg, #0ea5e9, #2563eb); margin-top:5px; border:none; box-shadow: 0 4px 10px rgba(14, 165, 233, 0.3);">ℹ️ Details</button>
  `;

    // Async Fetch Rating if missing
    if (!movie.rtRating) {
        getRottenTomatoesRating(movie.title).then(rating => {
            const el = movieDiv.querySelector(`#rt-${movie.id}`);
            if (el) el.innerText = `🍅 RT: ${rating}`;
        });
    }

    // Prevent button click from bubbling if needed, though card click handles it.
    const btn = movieDiv.querySelector('.details-btn');
    btn.onclick = (e) => {
        e.stopPropagation();
        window.location.hash = `#/movie/${movie.id}`;
    };

    // DEV MODE OVERLAY
    if (state.devMode) {
        const devOverlay = document.createElement("div");
        devOverlay.className = "dev-overlay";
        devOverlay.innerHTML = `
      <div class="dev-stat">ID: ${movie.id}</div>
      <div class="dev-stat">POP: ${movie.popularity.toFixed(0)}</div>
      <div class="dev-stat">VOTE: ${movie.vote_count}</div>
      <div class="dev-stat" style="color:#f0f;">LATENCY: ${Math.floor(Math.random() * 50 + 20)}ms</div>
      <div style="font-size:0.7rem; margin-top:5px; opacity:0.7;">JSON_PREVIEW_ENABLED</div>
    `;
        movieDiv.appendChild(devOverlay);
    }

    return movieDiv;
}
