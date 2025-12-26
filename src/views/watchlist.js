import { createMovieCard } from '../components/movieCard.js';
import { getUserRating } from '../components/rating.js';

export function renderWatchlist() {
  const app = document.getElementById("app");
  const watchlist = JSON.parse(localStorage.getItem("watchlist")) || [];

  app.innerHTML = `
    <div class="container" style="padding-top: 100px;">
      <h2 class="section-title">❤️ Your Watchlist</h2>
      <div id="watchlistGrid" class="movie-list"></div>
    </div>
  `;

  const grid = document.getElementById("watchlistGrid");

  if (watchlist.length === 0) {
    grid.innerHTML = "<p>Your watchlist is empty.</p>";
    return;
  }

  watchlist.forEach(movie => {
    const card = createMovieCard(movie);
    card.onclick = () => window.location.hash = `#/movie/${movie.id}`;

    // Append rating if exists
    const rating = getUserRating(movie.id);
    if (rating > 0) {
      const ratingBadge = document.createElement("div");
      ratingBadge.className = "watchlist-rating";
      ratingBadge.innerText = `Your Rating: ${rating}/5 ★`;
      ratingBadge.style.cssText = "color: #fbbf24; font-size: 0.9rem; margin-top: 8px; padding: 0 16px;";
      card.appendChild(ratingBadge);
    }

    grid.appendChild(card);
  });
}
