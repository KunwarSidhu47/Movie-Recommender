document.addEventListener("DOMContentLoaded", () => {
  let list = [];
  try {
    list = JSON.parse(localStorage.getItem("watchlist")) || [];
  } catch (e) {
    console.error("Watchlist corrupted, resetting.");
    localStorage.removeItem("watchlist");
    list = [];
  }

  const container = document.getElementById("watchlist");

  if (list.length === 0) {
    container.innerHTML = "<p>Your watchlist is empty 😢</p>";
    return;
  }

  list.forEach(movie => {
    const movieDiv = document.createElement("div");
    movieDiv.className = "movie";

    const poster = movie.poster_path
      ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
      : "https://via.placeholder.com/150x220?text=No+Image";

    const releaseYear = movie.release_date ? movie.release_date.slice(0, 4) : "Unknown";

    movieDiv.innerHTML = `
      <img src="${poster}" alt="${movie.title}" />
      <h4>${movie.title} (${releaseYear})</h4>
      <p>${movie.overview ? movie.overview.slice(0, 100) + "..." : "No description available."}</p>
      <div class="watchlist-actions">
        <button class="btn-remove" onclick="removeFromWatchlist(${movie.id})">❌ Remove</button>
        <button class="btn-watched-small" onclick='markAsWatched(${JSON.stringify(movie)})'>✅ Watched</button>
      </div>
    `;

    container.appendChild(movieDiv);
  });
}

function removeFromWatchlist(id) {
    let list = JSON.parse(localStorage.getItem("watchlist")) || [];
    list = list.filter(m => m.id !== id);
    localStorage.setItem("watchlist", JSON.stringify(list));
    displayWatchlist(); // Refresh
  }

// Re-use the markAsWatched logic from script.js if available, or duplicate simple version
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

    // Refresh UI
    displayWatchlist();

    // Show toast if displayMessage exists (it might not be imported here, so we check)
    if (typeof displayMessage === 'function') {
      displayMessage("🎉 Marked as Watched!");
    } else {
      alert("🎉 Marked as Watched!");
    }
  }