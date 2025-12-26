import { applyPowerFilter, handleSearch, handleRegionSearch, handleMoodSearch } from '../components/filter.js';
import { createMovieCard } from '../components/movieCard.js';
import { debounce } from '../utils.js';

export async function renderDiscover() {
  const app = document.getElementById("app");
  app.innerHTML = `
    <div class="container" style="padding-top: 100px;">
      <div class="search-section advanced-search glass-panel">
        <h3>⚡ Power Filter</h3>
        <div class="filter-section">
          <div class="filter-group">
            <label>Region</label>
            <select id="filterRegion">
              <option value="">All Regions</option>
              <option value="IN">India</option>
              <option value="US">USA</option>
              <option value="GB">UK</option>
              <option value="KR">South Korea</option>
              <option value="JP">Japan</option>
            </select>
          </div>
          <div class="filter-group">
            <label>Genre</label>
            <select id="filterGenre">
              <option value="">All Genres</option>
              <option value="28">Action</option>
              <option value="35">Comedy</option>
              <option value="18">Drama</option>
              <option value="27">Horror</option>
              <option value="10749">Romance</option>
              <option value="878">Sci-Fi</option>
            </select>
          </div>
          <div class="filter-group">
            <label>Year</label>
            <input type="number" id="filterYear" placeholder="e.g. 2023" min="1900" max="2099">
          </div>
          <div class="filter-group">
            <label>Min Rating</label>
            <input type="number" id="filterRating" placeholder="0-10" min="0" max="10" step="0.1">
          </div>
          <div class="filter-group" style="align-self: flex-end;">
            <button id="applyFilterBtn">⚡ Apply Filter</button>
          </div>
        </div>

        <div class="search-section glass-panel" style="margin-top: 20px;">
          <h3>Search by Title</h3>
          <div class="search-row">
            <input type="text" id="titleInput" placeholder="Enter movie title..." />
          </div>
        </div>

        <div class="results-header">
          <h2 id="section-title">🔍 Discover Movies</h2>
        </div>
        <div id="results" class="movie-list"></div>
      </div>
    </div>
  `;

  // Attach Listeners
  document.getElementById("applyFilterBtn").onclick = () => {
    applyPowerFilter(updateResults);
  };

  const searchInput = document.getElementById("titleInput");
  searchInput.addEventListener("input", debounce((e) => {
    const query = e.target.value.trim();
    if (query) {
      handleSearch(query, updateResults);
    }
  }, 500));

  // Check for mood param
  const hash = window.location.hash;
  if (hash.includes("?mood=")) {
    const moodId = hash.split("?mood=")[1];
    handleMoodSearch(moodId, updateResults);
  } else {
    // Default discovery load
    applyPowerFilter(updateResults);
  }
}

function updateResults(movies, title) {
  const resultsDiv = document.getElementById("results");
  const titleEl = document.getElementById("section-title");

  if (title) titleEl.innerText = title;
  resultsDiv.innerHTML = "";

  if (!movies || movies.length === 0) {
    resultsDiv.innerHTML = "<p>No movies found.</p>";
    return;
  }

  movies.forEach(movie => {
    resultsDiv.appendChild(createMovieCard(movie));
  });
}
