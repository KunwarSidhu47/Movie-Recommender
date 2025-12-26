import { CONFIG } from '../config.js';
import { getMovieDetails, getMovieCredits, getMovieProviders, getSimilarMovies, getRottenTomatoesRating } from '../api/tmdb.js';
import { showLoadingBar, hideLoadingBar, formatRuntime, getYearFromDate } from '../utils.js';

// We need to handle circular dependencies or event dispatching for things like 'searchByActor' or 'watchTrailer'.
// For now, we'll dispatch custom events that the main controller listens to.

export async function openModal(movieId) {
    const modal = document.getElementById("movieModal");
    showLoadingBar();

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
        const [movie, credits, providers, similar] = await Promise.all([
            getMovieDetails(movieId),
            getMovieCredits(movieId),
            getMovieProviders(movieId),
            getSimilarMovies(movieId)
        ]);

        // const rtRating = await getRottenTomatoesRating(movie.title); // Moved to async update

        // Populate Content
        document.getElementById("modalTitle").innerText = movie.title;
        document.getElementById("modalOverview").innerText = movie.overview || "No description available.";
        document.getElementById("modalPoster").src = movie.poster_path
            ? `${CONFIG.imageBaseUrl}/w500${movie.poster_path}` : "https://via.placeholder.com/200";

        const year = getYearFromDate(movie.release_date);
        const runtime = formatRuntime(movie.runtime);
        document.getElementById("modalMeta").innerText = `${year} • ${movie.genres.map(g => g.name).join(", ")} • ${runtime}`;
        document.getElementById("modalRT").innerText = `🍅 Loading...`;

        // Fetch RT Rating Asynchronously
        getRottenTomatoesRating(movie.title).then(rtRating => {
            const el = document.getElementById("modalRT");
            if (el) el.innerText = `🍅 Rotten Tomatoes: ${rtRating}`;
        });

        // Buttons
        const trailerBtn = document.getElementById("modalTrailerBtn");
        trailerBtn.onclick = () => {
            const event = new CustomEvent('watchTrailer', { detail: { movieId: movie.id } });
            document.dispatchEvent(event);
        };

        const saveBtn = document.getElementById("modalSaveBtn");
        // Watchlist logic needs to be handled. We can import a watchlist manager or dispatch event.
        // Let's dispatch for now to keep it decoupled.
        // Actually, simple local storage logic can stay here or move to a manager.
        // Let's keep it simple for now.
        updateWatchlistButton(saveBtn, movie);

        // Providers Logic
        const providerDiv = document.getElementById("providerLogos");
        providerDiv.innerHTML = "";
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
            providerDiv.innerHTML = "<span style='color:#777; font-size:14px;'>Not streaming on major platforms here.</span>";
        }

        // Cast Logic
        const castDiv = document.getElementById("castList");
        castDiv.innerHTML = "";
        credits.cast.slice(0, 6).forEach(actor => {
            const castItem = document.createElement("div");
            castItem.className = "cast-item";
            castItem.onclick = () => {
                closeModal();
                const event = new CustomEvent('searchByActor', { detail: { actorId: actor.id, actorName: actor.name } });
                document.dispatchEvent(event);
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

        // Similar Movies Logic
        displaySimilarMovies(similar.results);

        // User Rating Logic
        // setupUserRating(movie.id); // TODO: Extract this

        // Share Button Logic
        // setupShareButton(movie); // TODO: Extract this

    } catch (e) {
        console.error(e);
    } finally {
        hideLoadingBar();
    }
}

export function closeModal() {
    document.getElementById("movieModal").style.display = "none";
}

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
            setTimeout(() => openModal(movie.id), 300);
        };

        const poster = movie.poster_path
            ? `${CONFIG.imageBaseUrl}/w200${movie.poster_path}`
            : "https://via.placeholder.com/140x210?text=No+Image";

        card.innerHTML = `
      <img src="${poster}" alt="${movie.title}">
      <p>${movie.title}</p>
    `;
        container.appendChild(card);
    });
}

function updateWatchlistButton(btn, movie) {
    let watchlist = JSON.parse(localStorage.getItem("watchlist")) || [];
    const isSaved = watchlist.some(i => i.id === movie.id);

    if (isSaved) {
        btn.innerText = "✅ Mark as Watched";
        btn.className = "btn-watched";
        btn.onclick = () => {
            // Mark as watched logic (remove from watchlist?)
            // For now, let's just toggle save/unsave for simplicity or match previous logic
            removeFromWatchlist(movie.id);
            updateWatchlistButton(btn, movie);
        };
    } else {
        btn.innerText = "❤️ Save";
        btn.className = "btn-save";
        btn.onclick = () => {
            addToWatchlist(movie);
            updateWatchlistButton(btn, movie);
        };
    }
}

function addToWatchlist(movie) {
    let watchlist = JSON.parse(localStorage.getItem("watchlist")) || [];
    if (!watchlist.some(m => m.id === movie.id)) {
        watchlist.push(movie);
        localStorage.setItem("watchlist", JSON.stringify(watchlist));
        // dispatch event?
    }
}

function removeFromWatchlist(movieId) {
    let watchlist = JSON.parse(localStorage.getItem("watchlist")) || [];
    watchlist = watchlist.filter(m => m.id !== movieId);
    localStorage.setItem("watchlist", JSON.stringify(watchlist));
}
