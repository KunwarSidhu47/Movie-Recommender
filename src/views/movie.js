import { CONFIG } from '../config.js';
import { getMovieDetails, getMovieCredits, getMovieProviders, getSimilarMovies, getRottenTomatoesRating, getMovieVideos } from '../api/tmdb.js';
import { showLoadingBar, hideLoadingBar, formatRuntime, getYearFromDate } from '../utils.js';
import { createMovieCard } from '../components/movieCard.js';
import { openVideoModal } from '../components/videoModal.js';
import { displayMessage } from '../components/toast.js';
import { createRatingStars } from '../components/rating.js';

export async function renderMovie(params) {
  const movieId = params.id;
  const app = document.getElementById("app");

  // Initial Skeleton / Loading State
  app.innerHTML = `
    <div class="movie-details-container">
      <div class="movie-backdrop-hero"></div>
      <div class="container movie-content-layout">
        <div class="poster-column">
          <div class="poster-wrapper">
            <img id="moviePoster" src="https://via.placeholder.com/300x450?text=Loading..." alt="Poster">
          </div>
        </div>
        <div class="info-column">
          <h1 id="movieTitle">Loading...</h1>
          <div class="meta-row" id="movieMeta"></div>
          <div class="scores-row" id="movieScores"></div>
          <p id="movieOverview" class="movie-overview"></p>
          
          <div class="action-buttons">
            <button id="trailerBtn" class="btn-hero-primary">▶ Watch Trailer</button>
            <button id="saveBtn" class="btn-hero-secondary">❤️ Save to Watchlist</button>
          </div>
          
          <div id="userRatingContainer"></div>

          <div class="providers-section">
            <h4>📺 Available to Stream</h4>
            <div id="providerLogos" class="provider-list"></div>
          </div>
          
          <div class="cast-section">
            <h4>🎭 Top Cast</h4>
            <div id="castList" class="cast-tags"></div>
          </div>
        </div>
      </div>
      
      <div class="container similar-section">
        <h3>🎬 You Might Also Like</h3>
        <div id="similarMoviesList" class="movie-list"></div>
      </div>
    </div>
  `;

  showLoadingBar();

  try {
    const [movie, credits, providers, similar, videos] = await Promise.all([
      getMovieDetails(movieId),
      getMovieCredits(movieId),
      getMovieProviders(movieId),
      getSimilarMovies(movieId),
      getMovieVideos(movieId)
    ]);

    // const rtRating = await getRottenTomatoesRating(movie.title); // Moved to async update

    // Update Backdrop
    const backdropUrl = `${CONFIG.imageBaseUrl}/original${movie.backdrop_path}`;
    document.querySelector(".movie-backdrop-hero").style.backgroundImage = `url('${backdropUrl}')`;

    // Update Content
    document.getElementById("movieTitle").innerText = movie.title;
    document.getElementById("movieOverview").innerText = movie.overview;
    document.getElementById("moviePoster").src = movie.poster_path
      ? `${CONFIG.imageBaseUrl}/w500${movie.poster_path}` : "https://via.placeholder.com/300x450";

    const year = getYearFromDate(movie.release_date);
    const runtime = formatRuntime(movie.runtime);
    document.getElementById("movieMeta").innerText = `${year} • ${movie.genres.map(g => g.name).join(", ")} • ${runtime}`;

    document.getElementById("movieScores").innerHTML = `<span id="rtScore">🍅 Loading...</span> | ⭐ TMDb: ${movie.vote_average.toFixed(1)}`;

    // Fetch RT Rating Asynchronously
    getRottenTomatoesRating(movie.title).then(rtRating => {
      const rtDisplay = rtRating !== "N/A" ? `🍅 ${rtRating}` : "🍅 --";
      const el = document.getElementById("rtScore");
      if (el) el.innerText = rtDisplay;
    });

    // Actions
    // Actions
    document.getElementById("trailerBtn").onclick = () => {
      const trailer = videos.results.find(v => v.type === "Trailer" && v.site === "YouTube");
      if (trailer) {
        openVideoModal(trailer.key);
      } else {
        displayMessage("Sorry, no trailer available.", "error");
      }
    };

    // Watchlist Logic
    const saveBtn = document.getElementById("saveBtn");
    updateWatchlistButton(saveBtn, movie);

    // User Rating
    createRatingStars(movie.id, "userRatingContainer");

    // Providers
    const providerDiv = document.getElementById("providerLogos");
    const localProvider = providers.results[CONFIG.userRegion];
    if (localProvider && localProvider.flatrate) {
      localProvider.flatrate.forEach(p => {
        const providerItem = document.createElement("div");
        providerItem.className = "provider-item";

        const img = document.createElement("img");
        img.src = `${CONFIG.imageBaseUrl}/original${p.logo_path}`;
        img.title = p.provider_name;

        const name = document.createElement("span");
        name.className = "provider-name";
        name.innerText = p.provider_name;

        providerItem.appendChild(img);
        providerItem.appendChild(name);
        providerDiv.appendChild(providerItem);
      });
    } else {
      providerDiv.innerHTML = "<span style='color:#aaa;'>Not streaming on major platforms here.</span>";
    }

    // Cast
    const castDiv = document.getElementById("castList");
    credits.cast.slice(0, 6).forEach(actor => {
      const castItem = document.createElement("div");
      castItem.className = "cast-item";
      castItem.onclick = () => {
        window.location.hash = `#/actor/${actor.id}`;
      };

      const img = document.createElement("img");
      img.src = actor.profile_path
        ? `${CONFIG.imageBaseUrl}/w200${actor.profile_path}`
        : "https://via.placeholder.com/100x150?text=No+Image";
      img.alt = actor.name;

      const name = document.createElement("span");
      name.className = "cast-name";
      name.innerText = actor.name;

      castItem.appendChild(img);
      castItem.appendChild(name);
      castDiv.appendChild(castItem);
    });

    // Similar Movies
    const similarDiv = document.getElementById("similarMoviesList");
    similar.results.slice(0, 6).forEach(m => {
      // We use createMovieCard but need to override click to navigate
      const card = createMovieCard(m);
      card.onclick = () => window.location.hash = `#/movie/${m.id}`;
      similarDiv.appendChild(card);
    });

  } catch (e) {
    console.error(e);
  } finally {
    hideLoadingBar();
  }
}

function updateWatchlistButton(btn, movie) {
  let watchlist = JSON.parse(localStorage.getItem("watchlist")) || [];
  const isSaved = watchlist.some(i => i.id === movie.id);

  if (isSaved) {
    btn.innerText = "✅ Saved to Watchlist";
    btn.classList.add("btn-watched");
    btn.onclick = () => {
      let list = JSON.parse(localStorage.getItem("watchlist")) || [];
      list = list.filter(m => m.id !== movie.id);
      localStorage.setItem("watchlist", JSON.stringify(list));
      updateWatchlistButton(btn, movie);
    };
  } else {
    btn.innerText = "❤️ Save to Watchlist";
    btn.classList.remove("btn-watched");
    btn.onclick = () => {
      let list = JSON.parse(localStorage.getItem("watchlist")) || [];
      list.push(movie);
      localStorage.setItem("watchlist", JSON.stringify(list));
      updateWatchlistButton(btn, movie);
    };
  }
}
