const apiKey = "d7d36abcf57738dbcb3b2575c413b035"; // TMDb API key
const omdbApiKey = "797b99"; // <-- Get your OMDB API key from http://www.omdbapi.com/apikey.aspx

const genreMap = {
  action: 28,
  adventure: 12,
  animation: 16,
  comedy: 35,
  crime: 80,
  documentary: 99,
  drama: 18,
  family: 10751,
  fantasy: 14,
  history: 36,
  horror: 27,
  music: 10402,
  mystery: 9648,
  romance: 10749,
  sciencefiction: 878,
  scifi: 878,
  thriller: 53,
  war: 10752,
  western: 37,
  superhero: 28, // action-based
};

/**
 * Displays a custom message box instead of the native alert().
 * @param {string} message - The message to display.
 */
function displayMessage(message) {
  const messageBox = document.createElement('div');
  messageBox.className = 'custom-message-box';
  messageBox.innerHTML = `
    <p>${message}</p>
    <button onclick="this.parentNode.remove()">OK</button>
  `;
  document.body.appendChild(messageBox);

  // Automatically remove after a few seconds
  setTimeout(() => {
    if (messageBox.parentNode) {
      messageBox.remove();
    }
  }, 3000);
}

/**
 * Fetches Rotten Tomatoes rating for a given movie title from OMDB API.
 * @param {string} movieTitle - The title of the movie.
 * @returns {Promise<string>} - A promise that resolves with the Rotten Tomatoes rating or "N/A".
 */
async function getRottenTomatoesRating(movieTitle) {
  if (!omdbApiKey || omdbApiKey === "YOUR_OMDB_API_KEY") {
    console.warn("OMDB API key is not set. Cannot fetch Rotten Tomatoes ratings.");
    return "N/A (OMDB API key missing)";
  }

  try {
    const response = await fetch(`https://www.omdbapi.com/?t=${encodeURIComponent(movieTitle)}&apikey=${omdbApiKey}`);
    const data = await response.json();

    if (data.Response === "True" && data.Ratings) {
      const rtRating = data.Ratings.find(rating => rating.Source === "Rotten Tomatoes");
      return rtRating ? rtRating.Value : "N/A";
    }
    return "N/A";
  } catch (error) {
    console.error("Error fetching Rotten Tomatoes rating:", error);
    return "N/A";
  }
}

/**
 * Displays a list of movies in the results div.
 * @param {Array<Object>} movies - An array of movie objects from TMDb.
 */
async function displayMovies(movies) {
  const resultsDiv = document.getElementById("results");
  resultsDiv.innerHTML = ""; // Clear previous results

  if (movies.length === 0) {
    resultsDiv.innerHTML = `<p>No movies found.</p>`;
    return;
  }

  for (const movie of movies) {
    const movieDiv = document.createElement("div");
    movieDiv.className = "movie";

    const poster = movie.poster_path
      ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
      : "https://placehold.co/150x220/333333/FFFFFF?text=No+Image";

    const releaseYear = movie.release_date ? movie.release_date.slice(0, 4) : "Unknown";

    // Fetch Rotten Tomatoes rating asynchronously
    const rtRating = await getRottenTomatoesRating(movie.title);

    movieDiv.innerHTML = `
      <img src="${poster}" alt="${movie.title}" />
      <h4>${movie.title} (${releaseYear})</h4>
      <p>${movie.overview ? movie.overview.slice(0, 100) + "..." : "No description available."}</p>
      <div class="rating-info">
        <span>🍅 Rotten Tomatoes: ${rtRating}</span>
      </div>
      <button onclick="watchTrailer(${movie.id})">🎥 Watch Trailer</button>
      <button onclick="saveToWatchlistById(${movie.id})">❤️ Save</button>
    `;

    resultsDiv.appendChild(movieDiv);
  }
}

/**
 * Searches for movies by genre and displays them.
 */
async function searchByGenre() {
  const genreInput = document.getElementById("genreInput").value.toLowerCase().replace(/\s/g, "");
  const genreId = genreMap[genreInput];

  const resultsDiv = document.getElementById("results");
  resultsDiv.innerHTML = `<p>Loading recommendations...</p>`; // Loading message

  if (!genreId) {
    resultsDiv.innerHTML = `<p>No such genre found. Try comedy, horror, action, etc.</p>`;
    return;
  }

  try {
    const response = await fetch(`https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&with_genres=${genreId}&sort_by=popularity.desc`);
    const data = await response.json();
    const movies = data.results.slice(0, 10); // top 10 movies

    await displayMovies(movies); // Use the common display function
  } catch (err) {
    resultsDiv.innerHTML = `<p>Error fetching movies. Please try again later.</p>`;
    console.error(err);
  }
}

/**
 * Searches for movies by title and displays them.
 */
async function searchByTitle() {
  const titleInput = document.getElementById("titleInput").value.trim();

  const resultsDiv = document.getElementById("results");
  resultsDiv.innerHTML = `<p>Searching for movies...</p>`; // Loading message

  if (!titleInput) {
    resultsDiv.innerHTML = `<p>Please enter a movie title to search.</p>`;
    return;
  }

  try {
    const response = await fetch(`https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(titleInput)}`);
    const data = await response.json();
    const movies = data.results.slice(0, 10); // top 10 movies

    await displayMovies(movies); // Use the common display function
  } catch (err) {
    resultsDiv.innerHTML = `<p>Error searching for movies. Please try again later.</p>`;
    console.error(err);
  }
}


/**
 * Watches the trailer for a given movie ID.
 * @param {number} movieId - The ID of the movie.
 */
function watchTrailer(movieId) {
  fetch(`https://api.themoviedb.org/3/movie/${movieId}/videos?api_key=${apiKey}`)
    .then(response => response.json())
    .then(data => {
      const trailer = data.results.find(video => video.type === "Trailer" && video.site === "YouTube");
      if (trailer) {
        const url = `https://www.youtube.com/watch?v=${trailer.key}`;
        window.open(url, "_blank");
      } else {
        displayMessage("Trailer not available.");
      }
    })
    .catch(err => {
      displayMessage("Error fetching trailer.");
      console.error(err);
    });
}

/**
 * Saves a movie object to the watchlist in local storage.
 * @param {object} movie - The movie object to save.
 */
function saveToWatchlist(movie) {
  let list = JSON.parse(localStorage.getItem("watchlist")) || [];
  if (!list.find(item => item.id === movie.id)) {
    list.push(movie);
    localStorage.setItem("watchlist", JSON.stringify(list));
    displayMessage(`✅ Saved "${movie.title}" to watchlist`);
  } else {
    displayMessage("Already in watchlist!");
  }
}

/**
 * Fetches movie details by ID and then saves it to the watchlist.
 * @param {number} id - The ID of the movie to save.
 */
function saveToWatchlistById(id) {
  fetch(`https://api.themoviedb.org/3/movie/${id}?api_key=${apiKey}`)
    .then(response => response.json())
    .then(movie => {
      saveToWatchlist(movie);
    })
    .catch(err => {
      displayMessage("Error saving movie to watchlist.");
      console.error(err);
    });
}
