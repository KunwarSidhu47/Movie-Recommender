const apiKey = "d7d36abcf57738dbcb3b2575c413b035"; // TMDb API Key
const omdbApiKey = "797b99"; // OMDB API Key (For Rotten Tomatoes)
const userRegion = "IN"; // Change to "US", "GB", etc. for streaming providers

// --- STATE MANAGEMENT ---
// This tracks what the user is currently looking at so "Load More" works correctly
let currentState = {
  mode: 'trending', // Modes: 'trending', 'search', 'genre', 'region', 'actor', 'filter'
  query: null,      // Stores the Search Term, Genre ID, Region Code, or Actor ID
  page: 1,          // Current Page Number
  filterParams: {}, // Stores complex filter data (Region + Genre + Year)
  results: [],       // Store current results for sorting
  devMode: false    // Dev Mode State
};

// --- MAPPINGS ---
const genreMap = {
  action: 28, adventure: 12, animation: 16, comedy: 35, crime: 80,
  documentary: 99, drama: 18, family: 10751, fantasy: 14, history: 36,
  horror: 27, music: 10402, mystery: 9648, romance: 10749, sci_fi: 878, thriller: 53
};

const moodMap = {
  happy: 35,          // Comedy
  sad: 18,            // Drama
  adrenaline: 28,     // Action
  romantic: 10749,    // Romance
  scared: 27,         // Horror
  curious: 9648       // Mystery
};

// --- INITIALIZATION ---
document.addEventListener("DOMContentLoaded", () => {
  getTrendingMovies(); // Load trending movies on start

  // FEATURE: HORIZONTAL CAROUSELS
  loadCarousel(878, 'carousel-scifi', '🚀 Sci-Fi Favorites');
  loadCarousel(28, 'carousel-action', '💥 Action Blockbusters');
  loadCarousel(18, 'carousel-drama', '🎭 Critically Acclaimed Dramas');

  // FEATURE: DEBOUNCED SEARCH
  const searchInput = document.getElementById("titleInput");
  if (searchInput) {
    // Wait 1000ms (1 second) after typing stops before sending API request
    searchInput.addEventListener('input', debounce((e) => {
      const query = e.target.value.trim();
      if (query.length > 2) {
        searchByTitle(query);
      }
    }, 1000));
  }

  // FEATURE: SORTING
  const sortSelect = document.getElementById("sortResultsBy");
  if (sortSelect) {
    sortSelect.addEventListener("change", () => sortDisplayedMovies());
  }

  // FEATURE: YEAR INPUT VALIDATION
  const yearInput = document.getElementById("filterYear");
  if (yearInput) {
    yearInput.addEventListener("change", () => {
      const val = parseInt(yearInput.value);
      if (yearInput.value && (val < 1900 || val > 2099)) {
        displayMessage("⚠️ Year must be between 1900 and 2099", "error");
        yearInput.value = ""; // Clear invalid input
      }
    });
  }
});

// --- UTILITY: DEBOUNCE ---
function debounce(func, wait) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

// --- FEATURE: PAGINATION (LOAD MORE) ---
async function loadMoreMovies() {
  currentState.page++; // Increment page
  const btn = document.getElementById("loadMoreBtn");
  btn.innerText = "Loading...";

  let url = "";

  // Route logic based on current mode
  if (currentState.mode === 'trending') {
    url = `https://api.themoviedb.org/3/trending/movie/week?api_key=${apiKey}&page=${currentState.page}`;
  } else if (currentState.mode === 'search') {
    url = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(currentState.query)}&page=${currentState.page}`;
  } else if (currentState.mode === 'genre') {
    url = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&with_genres=${currentState.query}&page=${currentState.page}&sort_by=popularity.desc`;
  } else if (currentState.mode === 'region') {
    url = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&with_origin_country=${currentState.query}&page=${currentState.page}&sort_by=popularity.desc`;
  } else if (currentState.mode === 'actor') {
    url = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&with_cast=${currentState.query}&page=${currentState.page}&sort_by=popularity.desc`;
  }
  // LOGIC FOR MULTI-SELECT POWER FILTER
  else if (currentState.mode === 'filter') {
    const { region, genre, year, rating } = currentState.filterParams;
    url = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&sort_by=popularity.desc&page=${currentState.page}`;
    if (region) url += `&with_origin_country=${region}`;
    if (genre) url += `&with_genres=${genre}`;
    if (year) url += `&primary_release_year=${year}`;
    if (rating) url += `&vote_average.gte=${rating}`;
  }

  try {
    const res = await fetch(url);
    const data = await res.json();

    // 'true' flag tells displayMovies to append results, not clear them
    await displayMovies(data.results, null, true);

    btn.innerText = "⬇️ Load More Movies";
    if (!data.results || data.results.length === 0) {
      btn.style.display = "none"; // Hide if no more results
    }
  } catch (e) {
    console.error(e);
    btn.innerText = "Error loading more";
  }
}

// --- FEATURE: POWER FILTER (MULTI-SELECT) ---
async function applyPowerFilter() {
  // 1. Get all values from inputs
  const region = document.getElementById("filterRegion")?.value || "";
  const genre = document.getElementById("filterGenre").value;
  const year = document.getElementById("filterYear").value;
  const rating = document.getElementById("filterRating").value;

  // Validate Year
  if (year) {
    const yearNum = parseInt(year);
    if (yearNum < 1900 || yearNum > 2099) {
      displayMessage("⚠️ Year must be between 1900 and 2099", "error");
      return;
    }
  }

  // 2. Save state for pagination
  currentState = {
    mode: 'filter',
    page: 1,
    filterParams: { region, genre, year, rating }
  };

  // 3. Build URL
  let url = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&sort_by=popularity.desc`;
  if (region) url += `&with_origin_country=${region}`;
  if (genre) url += `&with_genres=${genre}`;
  if (year) url += `&primary_release_year=${year}`;
  if (rating) url += `&vote_average.gte=${rating}`;

  // 4. Fetch
  try {
    showLoadingBar();
    toggleCarousels(false); // Hide carousels on filter
    const res = await fetch(url);
    const data = await res.json();
    await displayMovies(data.results, "⚡ Custom Filter Results");
  } catch (e) {
    console.error(e);
    displayMessage("Error fetching filtered movies.", "error");
  } finally {
    hideLoadingBar();
  }
}

// --- CORE DISPLAY FUNCTION ---
async function displayMovies(movies, titleText = "", append = false) {
  const resultsDiv = document.getElementById("results");
  const loadMoreBtn = document.getElementById("loadMoreBtn");

  // Store results for sorting if not appending
  if (!append) {
    currentState.results = movies;
  } else {
    currentState.results = [...(currentState.results || []), ...movies];
  }

  // If not appending (fresh search), clear previous results
  if (!append) {
    if (titleText) document.getElementById("section-title").innerText = titleText;
    showSkeletons(10); // Show 10 skeleton cards immediately
  }

  if (!movies || movies.length === 0) {
    if (!append) resultsDiv.innerHTML = `<p>No movies found.</p>`;
    loadMoreBtn.style.display = "none";
    return;
  }

  // Parallel Fetch for Rotten Tomatoes Ratings
  const moviesWithData = await Promise.all(movies.map(async m => {
    const rt = await getRottenTomatoesRating(m.title);
    return { ...m, rtRating: rt };
  }));

  // Clear loading text if fresh search
  if (!append) resultsDiv.innerHTML = "";

  moviesWithData.forEach(movie => {
    const movieDiv = document.createElement("div");
    movieDiv.className = "movie";
    movieDiv.onclick = () => openModal(movie.id); // Click entire card to open modal

    // 3D Tilt Effect Logic
    movieDiv.addEventListener('mousemove', (e) => {
      const rect = movieDiv.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -5; // Reduced from 10 to 5 for subtlety
      const rotateY = ((x - centerX) / centerX) * 5;

      movieDiv.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
    });

    movieDiv.addEventListener('mouseleave', () => {
      movieDiv.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
    });

    const poster = movie.poster_path
      ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
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
      <div class="rating-info">🍅 RT: ${movie.rtRating}</div>
      <button onclick="event.stopPropagation(); openModal(${movie.id})" style="background: linear-gradient(135deg, #0ea5e9, #2563eb); margin-top:5px; border:none; box-shadow: 0 4px 10px rgba(14, 165, 233, 0.3);">ℹ️ Details</button>
    `;

    // DEV MODE OVERLAY
    if (currentState.devMode) {
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
    resultsDiv.appendChild(movieDiv);
  });

  // Scroll Reveal Observer
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.animationPlayState = 'running';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.movie').forEach(card => {
    card.style.animationPlayState = 'paused'; // Start paused
    observer.observe(card);
  });

  // Always show load more button if results exist
  loadMoreBtn.style.display = "inline-block";
}

// --- STANDARD SEARCH FUNCTIONS ---

// --- STANDARD SEARCH FUNCTIONS ---

function toggleCarousels(show) {
  const carousels = document.querySelectorAll('.carousel-section');
  carousels.forEach(c => c.style.display = show ? 'block' : 'none');
}

async function getTrendingMovies() {
  showLoadingBar();
  toggleCarousels(true); // Show carousels on home
  currentState = { mode: 'trending', page: 1 };
  const res = await fetch(`https://api.themoviedb.org/3/trending/movie/week?api_key=${apiKey}`);
  const data = await res.json();

  // HERO SECTION LOGIC
  if (data.results.length > 0) {
    const heroMovie = data.results[0]; // Top trending movie
    setupHeroSection(heroMovie);
  }

  await displayMovies(data.results, "🔥 Trending This Week");
  hideLoadingBar();
}

function setupHeroSection(movie) {
  const heroSection = document.getElementById("heroSection");
  const title = document.getElementById("heroTitle");
  const overview = document.getElementById("heroOverview");
  const trailerBtn = document.getElementById("heroTrailerBtn");
  const detailsBtn = document.getElementById("heroDetailsBtn");

  if (!heroSection) return;

  // Set Background
  const backdropUrl = `https://image.tmdb.org/t/p/original${movie.backdrop_path}`;
  heroSection.style.backgroundImage = `url('${backdropUrl}')`;

  // Set Content
  title.innerText = movie.title;
  overview.innerText = movie.overview;

  // Set Actions
  trailerBtn.onclick = () => watchTrailer(movie.id);
  detailsBtn.onclick = () => openModal(movie.id);
}

// --- DEV MODE LOGIC ---
function toggleDevMode() {
  currentState.devMode = !currentState.devMode;
  const btn = document.getElementById("devModeToggle");

  if (currentState.devMode) {
    btn.innerText = "👨‍💻 Dev Mode: ON";
    btn.classList.add("active");
    displayMessage("💻 Dev Mode Activated: Inspecting API Data...");
  } else {
    btn.innerText = "👨‍💻 Dev Mode: OFF";
    btn.classList.remove("active");
    displayMessage("🎬 Returning to Cinema Mode");
  }

  // Re-render movies to show/hide overlays
  if (currentState.results.length > 0) {
    displayMovies(currentState.results, null, false); // Re-render current list
  }
}

async function searchByTitle(query) {
  if (!query) return;
  showLoadingBar();
  toggleCarousels(false); // Hide carousels on search
  currentState = { mode: 'search', query: query, page: 1 };
  const res = await fetch(`https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(query)}`);
  const data = await res.json();
  await displayMovies(data.results, `Results for: "${query}"`);
  hideLoadingBar();
}

async function searchByMood(mood) {
  showLoadingBar();
  toggleCarousels(false); // Hide carousels on filter
  const genreId = moodMap[mood];
  currentState = { mode: 'genre', query: genreId, page: 1 };
  const res = await fetch(`https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&with_genres=${genreId}&sort_by=popularity.desc`);
  const data = await res.json();
  await displayMovies(data.results, `Mood: ${mood.toUpperCase()}`);
  hideLoadingBar();
}

// Direct Region Button Click (e.g., "Explore India")
async function searchByRegion(isoCode, regionName) {
  showLoadingBar();
  toggleCarousels(false); // Hide carousels on filter
  currentState = { mode: 'region', query: isoCode, page: 1 };
  const res = await fetch(`https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&with_origin_country=${isoCode}&sort_by=popularity.desc`);
  const data = await res.json();
  await displayMovies(data.results, `🌎 Top Movies from ${regionName}`);
  hideLoadingBar();
}

// Click on Actor in Modal
async function searchByActor(actorId, name) {
  showLoadingBar();
  toggleCarousels(false); // Hide carousels on filter
  currentState = { mode: 'actor', query: actorId, page: 1 };
  const res = await fetch(`https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&with_cast=${actorId}&sort_by=popularity.desc`);
  const data = await res.json();
  await displayMovies(data.results, `Starring: ${name}`);
  hideLoadingBar();
}

async function surpriseMe() {
  showLoadingBar();
  // Don't hide carousels for surprise me as it opens a modal directly
  const page = Math.floor(Math.random() * 10) + 1;
  const res = await fetch(`https://api.themoviedb.org/3/movie/top_rated?api_key=${apiKey}&page=${page}`);
  const data = await res.json();
  if (data.results.length > 0) {
    const randomMovie = data.results[Math.floor(Math.random() * data.results.length)];
    openModal(randomMovie.id); // Open details directly
  }
  hideLoadingBar();
}

// --- DEEP DIVE MODAL ---
async function openModal(movieId) {
  const modal = document.getElementById("movieModal");
  showLoadingBar(); // Show loading bar

  // Clear previous data / Show loading state
  document.getElementById("modalTitle").innerText = "Loading...";
  document.getElementById("modalOverview").innerText = "";
  document.getElementById("modalPoster").src = "https://via.placeholder.com/200?text=Loading...";
  document.getElementById("modalMeta").innerText = "";
  document.getElementById("modalRT").innerText = "";
  document.getElementById("providerLogos").innerHTML = "";
  document.getElementById("castList").innerHTML = "";
  document.getElementById("similarMoviesList").innerHTML = "";

  modal.style.display = "block";

  try {
    // Fetch Details, Cast, Providers, and Similar Movies in parallel
    const [movieRes, creditsRes, providersRes, similarRes] = await Promise.all([
      fetch(`https://api.themoviedb.org/3/movie/${movieId}?api_key=${apiKey}`),
      fetch(`https://api.themoviedb.org/3/movie/${movieId}/credits?api_key=${apiKey}`),
      fetch(`https://api.themoviedb.org/3/movie/${movieId}/watch/providers?api_key=${apiKey}`),
      fetch(`https://api.themoviedb.org/3/movie/${movieId}/similar?api_key=${apiKey}`)
    ]);

    const movie = await movieRes.json();
    const credits = await creditsRes.json();
    const providers = await providersRes.json();
    const similar = await similarRes.json();
    const rtRating = await getRottenTomatoesRating(movie.title);

    // Populate Content
    document.getElementById("modalTitle").innerText = movie.title;
    document.getElementById("modalOverview").innerText = movie.overview || "No description available.";
    document.getElementById("modalPoster").src = movie.poster_path
      ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : "https://via.placeholder.com/200";

    const year = movie.release_date ? movie.release_date.slice(0, 4) : "N/A";
    const runtime = movie.runtime ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m` : "N/A";
    document.getElementById("modalMeta").innerText = `${year} • ${movie.genres.map(g => g.name).join(", ")} • ${runtime}`;
    document.getElementById("modalRT").innerText = `🍅 Rotten Tomatoes: ${rtRating}`;

    // Buttons
    const trailerBtn = document.getElementById("modalTrailerBtn");
    trailerBtn.onclick = () => watchTrailer(movie.id);

    const saveBtn = document.getElementById("modalSaveBtn");

    // Check if already in watchlist
    let watchlist = JSON.parse(localStorage.getItem("watchlist")) || [];
    const isSaved = watchlist.some(i => i.id === movie.id);

    if (isSaved) {
      saveBtn.innerText = "✅ Mark as Watched";
      saveBtn.className = "btn-watched"; // Apply new style
      saveBtn.onclick = () => markAsWatched(movie);
    } else {
      saveBtn.innerText = "❤️ Save";
      saveBtn.className = "btn-save";
      saveBtn.onclick = () => saveToWatchlist(movie);
    }

    // Providers Logic
    const providerDiv = document.getElementById("providerLogos");
    providerDiv.innerHTML = "";
    const localProvider = providers.results[userRegion]; // e.g., "IN"

    if (localProvider && localProvider.flatrate) {
      localProvider.flatrate.forEach(p => {
        const img = document.createElement("img");
        img.src = `https://image.tmdb.org/t/p/original${p.logo_path}`;
        img.title = p.provider_name;
        providerDiv.appendChild(img);
      });
    } else {
      providerDiv.innerHTML = "<span style='color:#777; font-size:14px;'>Not streaming on major platforms here.</span>";
    }

    // Cast Logic
    const castDiv = document.getElementById("castList");
    castDiv.innerHTML = "";
    credits.cast.slice(0, 6).forEach(actor => {
      const span = document.createElement("span");
      span.innerText = actor.name;
      span.onclick = () => {
        closeModal();
        searchByActor(actor.id, actor.name); // Relational search
      };
      castDiv.appendChild(span);
    });

    // Similar Movies Logic
    displaySimilarMovies(similar.results);

    // User Rating Logic
    setupUserRating(movie.id);

    // Share Button Logic
    setupShareButton(movie);

  } catch (e) {
    console.error(e);
  } finally {
    hideLoadingBar();
  }
}

function closeModal() {
  document.getElementById("movieModal").style.display = "none";
}

// Close modal when clicking outside the content box
window.onclick = function (e) {
  const modal = document.getElementById("movieModal");
  if (e.target == modal) {
    closeModal();
  }
}

// --- HELPERS ---

async function getRottenTomatoesRating(title) {
  if (!omdbApiKey) return "N/A";
  try {
    const res = await fetch(`https://www.omdbapi.com/?t=${encodeURIComponent(title)}&apikey=${omdbApiKey}`);
    const data = await res.json();
    return (data.Ratings?.find(r => r.Source === "Rotten Tomatoes")?.Value) || "N/A";
  } catch (e) { return "N/A"; }
}

function watchTrailer(id) {
  fetch(`https://api.themoviedb.org/3/movie/${id}/videos?api_key=${apiKey}`)
    .then(r => r.json())
    .then(d => {
      const t = d.results.find(v => v.site === "YouTube" && v.type === "Trailer");
      if (t) window.open(`https://www.youtube.com/watch?v=${t.key}`, "_blank");
      else displayMessage("Trailer not available");
    });
}

function saveToWatchlist(movie) {
  let list = JSON.parse(localStorage.getItem("watchlist")) || [];
  if (!list.some(i => i.id === movie.id)) {
    list.push(movie);
    localStorage.setItem("watchlist", JSON.stringify(list));
    displayMessage("✅ Saved to Watchlist");
  } else {
    displayMessage("⚠️ Already Saved");
  }
}

// --- TOAST NOTIFICATIONS ---

function displayMessage(message, type = 'success') {
  const container = document.getElementById("toast-container");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <span>${type === 'error' ? '⚠️' : '✅'}</span>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  // Auto remove after 3 seconds
  setTimeout(() => {
    toast.style.animation = "toastSlideOut 0.3s forwards";
    toast.addEventListener("animationend", () => {
      toast.remove();
    });
  }, 3000);
}

// --- SKELETON LOADING ---

function showSkeletons(count) {
  const resultsDiv = document.getElementById("results");
  resultsDiv.innerHTML = ""; // Clear existing content

  for (let i = 0; i < count; i++) {
    const skeleton = document.createElement("div");
    skeleton.className = "skeleton-card";
    skeleton.innerHTML = `
      <div class="skeleton skeleton-poster"></div>
      <div class="skeleton skeleton-text"></div>
      <div class="skeleton skeleton-text short"></div>
    `;
    resultsDiv.appendChild(skeleton);
  }
}

// --- NEW FEATURES LOGIC ---

function displaySimilarMovies(movies) {
  const container = document.getElementById("similarMoviesList");
  container.innerHTML = "";

  if (!movies || movies.length === 0) {
    container.innerHTML = "<p style='color:#777;'>No similar movies found.</p>";
    return;
  }

  movies.forEach(movie => {
    const card = document.createElement("div");
    card.className = "similar-movie-card";
    card.onclick = () => {
      closeModal();
      setTimeout(() => openModal(movie.id), 300); // Small delay for smooth transition
    };

    const poster = movie.poster_path
      ? `https://image.tmdb.org/t/p/w200${movie.poster_path}`
      : "https://via.placeholder.com/140x210?text=No+Image";

    card.innerHTML = `
      <img src="${poster}" alt="${movie.title}">
      <p>${movie.title}</p>
    `;
    container.appendChild(card);
  });
}

function setupUserRating(movieId) {
  const stars = document.querySelectorAll("#userRatingStars span");
  const savedRatings = JSON.parse(localStorage.getItem("userRatings")) || {};
  const currentRating = savedRatings[movieId] || 0;

  // Reset stars
  stars.forEach(star => {
    star.classList.remove("active");
    if (parseInt(star.dataset.value) <= currentRating) {
      star.classList.add("active");
    }

    // Click Event
    star.onclick = function () {
      const rating = parseInt(this.dataset.value);
      handleRating(movieId, rating);
    };
  });
}

function handleRating(movieId, rating) {
  let ratings = JSON.parse(localStorage.getItem("userRatings")) || {};
  ratings[movieId] = rating;
  localStorage.setItem("userRatings", JSON.stringify(ratings));

  displayMessage(`You rated this ${rating} stars! ⭐`);
  setupUserRating(movieId); // Refresh UI
}

function setupShareButton(movie) {
  const btn = document.getElementById("modalShareBtn");
  const shareData = {
    title: movie.title,
    text: `Check out ${movie.title} on Movie Recommender Pro!`,
    url: window.location.href // In a real app, this might be a specific deep link
  };

  btn.onclick = async () => {
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log("Share canceled");
      }
    } else {
      // Fallback
      navigator.clipboard.writeText(`${movie.title} - Check it out!`);
      displayMessage("Link copied to clipboard! 📋");
    }
  };
}

// --- WATCHLIST & UX IMPROVEMENTS ---

function markAsWatched(movie) {
  // 1. Remove from Watchlist
  let watchlist = JSON.parse(localStorage.getItem("watchlist")) || [];
  watchlist = watchlist.filter(i => i.id !== movie.id);
  localStorage.setItem("watchlist", JSON.stringify(watchlist));

  // 2. Add to Watched Movies
  let watched = JSON.parse(localStorage.getItem("watchedMovies")) || [];
  if (!watched.some(i => i.id === movie.id)) {
    watched.push(movie);
    localStorage.setItem("watchedMovies", JSON.stringify(watched));
  }

  displayMessage("🎉 Marked as Watched!");
  closeModal();

  // If on watchlist page, reload to update UI
  if (window.location.pathname.includes("watchlist.html")) {
    location.reload();
  }
}

function sortDisplayedMovies() {
  const sortValue = document.getElementById("sortResultsBy").value;
  if (!currentState.results || currentState.results.length === 0) return;

  let sorted = [...currentState.results];

  if (sortValue === "vote_average.desc") {
    sorted.sort((a, b) => b.vote_average - a.vote_average);
  } else if (sortValue === "release_date.desc") {
    sorted.sort((a, b) => new Date(b.release_date) - new Date(a.release_date));
  } else {
    // Default: Popularity (API default usually, but we can sort locally too)
    sorted.sort((a, b) => b.popularity - a.popularity);
  }

  // Redisplay without fetching
  displayMovies(sorted, null, false); // false = don't append, replace
}

function showLoadingBar() {
  const bar = document.getElementById("progressBar");
  if (bar) bar.classList.add("active");
}

function hideLoadingBar() {
  const bar = document.getElementById("progressBar");
  if (bar) {
    setTimeout(() => {
      bar.classList.remove("active");
    }, 500); // Small delay to let animation finish
  }
}

// --- HORIZONTAL CAROUSEL LOGIC ---

async function loadCarousel(genreId, containerId, title) {
  const container = document.getElementById(containerId);
  if (!container) return;

  // Add Title
  const titleEl = document.createElement("h3");
  titleEl.innerText = title;
  container.appendChild(titleEl);

  // Add Carousel Container
  const carousel = document.createElement("div");
  carousel.className = "horizontal-carousel";
  container.appendChild(carousel);

  try {
    // Fetch top rated movies for genre
    const res = await fetch(`https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&with_genres=${genreId}&sort_by=vote_average.desc&vote_count.gte=300&page=1`);
    const data = await res.json();
    const movies = data.results.slice(0, 15); // Top 15

    movies.forEach(movie => {
      const card = document.createElement("div");
      card.className = "carousel-card";
      card.onclick = () => openModal(movie.id);

      const poster = movie.poster_path
        ? `https://image.tmdb.org/t/p/w200${movie.poster_path}`
        : "https://via.placeholder.com/160x240?text=No+Image";

      const rating = movie.vote_average ? movie.vote_average.toFixed(1) : "N/A";

      card.innerHTML = `
        <img src="${poster}" alt="${movie.title}">
        <div class="rating">⭐ ${rating}</div>
        <h4>${movie.title}</h4>
      `;
      carousel.appendChild(card);
    });

  } catch (e) {
    console.error(`Error loading carousel ${title}:`, e);
    carousel.innerHTML = "<p style='color:#777; padding:10px;'>Failed to load movies.</p>";
  }
}