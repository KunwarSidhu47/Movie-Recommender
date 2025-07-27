document.addEventListener("DOMContentLoaded", () => {
  const list = JSON.parse(localStorage.getItem("watchlist")) || [];
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
      <button onclick="removeFromWatchlist(${movie.id})">🗑️ Remove</button>
    `;

    container.appendChild(movieDiv);
  });
});

function removeFromWatchlist(id) {
  let list = JSON.parse(localStorage.getItem("watchlist")) || [];
  list = list.filter(movie => movie.id !== id);
  localStorage.setItem("watchlist", JSON.stringify(list));
  location.reload(); // refresh to update list
}
