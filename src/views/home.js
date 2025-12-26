import { fetchTrendingMovies } from '../api/tmdb.js';
import { setupHeroSection } from '../components/hero.js';
import { createCarousel } from '../components/carousel.js';
import { MOODS } from '../config/moods.js';
import { showLoadingBar, hideLoadingBar } from '../utils.js';

export async function renderHome() {
  const app = document.getElementById("app");
  app.innerHTML = `
    <div id="heroSection" class="hero-container">
      <div class="hero-overlay"></div>
      <div class="hero-content">
        <h1 id="heroTitle">Rolling Film...</h1>
        <p id="heroOverview" class="hero-overview">Setting the scene for your cinematic journey.</p>
        <div class="hero-actions">
          <button id="heroDetailsBtn" class="btn-hero-primary">More Info</button>
          <button id="heroTrailerBtn" class="btn-hero-secondary">▶ Play Trailer</button>
        </div>
      </div>
    </div>

    <div class="container">
      <div class="mood-section glass-panel" style="text-align:center; margin-bottom:60px;">
        <h2>🔮 What's your Vibe?</h2>
        <div class="mood-grid">
            ${MOODS.map(mood => `
                <div class="mood-card" onclick="window.location.hash='#/discover?mood=${mood.id}'">
                    <div class="mood-emoji">${mood.emoji}</div>
                    <div class="mood-label">${mood.label}</div>
                    <div class="mood-desc">${mood.desc}</div>
                </div>
            `).join('')}
        </div>
      </div>

      <div id="carouselsContainer"></div>
    </div>
  `;

  showLoadingBar();
  try {
    const data = await fetchTrendingMovies();

    if (data && data.results && data.results.length > 0) {
      // Netflix-Style: Pick a random movie from the top 10
      const randomIndex = Math.floor(Math.random() * Math.min(10, data.results.length));
      setupHeroSection(data.results[randomIndex]);
    } else {
      throw new Error("No trending data found");
    }

    await createCarousel("🔥 Trending Now", "trending");
    await createCarousel("⭐ Top Rated", "top_rated");
    await createCarousel("🎬 Action Hits", "28");
    await createCarousel("🤣 Comedy Picks", "35");

  } catch (e) {
    console.warn("API failed, using fallback.", e);

    // 🛡️ The "Never Blank" Fallback
    const fallbackMovie = {
      id: 157336, // Interstellar ID
      title: "Interstellar",
      overview: "The adventures of a group of explorers who make use of a newly discovered wormhole to surpass the limitations on human space travel and conquer the vast distances involved in an interstellar voyage.",
      backdrop_path: "/xJHokMBLlb5Kd0BLWOXAzHWHXyk.jpg", // Known valid path
      poster_path: "/gEU2QniL6C8zYEFeuDObl72qtNY.jpg"
    };

    setupHeroSection(fallbackMovie);

    // Also try to load carousels even if trending failed, maybe other endpoints work
    // If not, they will just fail silently and log errors, but the hero will be up.
  } finally {
    hideLoadingBar();
  }
}
