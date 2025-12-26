import { getPersonDetails, getPersonMovieCredits } from '../api/tmdb.js';
import { createMovieCard } from '../components/movieCard.js';
import { showLoadingBar, hideLoadingBar, getYearFromDate } from '../utils.js';
import { CONFIG } from '../config.js';

export async function renderActor(params) {
    const actorId = params.id;
    const app = document.getElementById("app");

    app.innerHTML = `
    <div class="container" style="padding-top: 100px;">
        <div class="actor-profile glass-panel">
            <div class="actor-header">
                <img id="actorImage" src="https://via.placeholder.com/200x300" alt="Actor">
                <div class="actor-info">
                    <h1 id="actorName">Loading...</h1>
                    <p id="actorBio" class="actor-bio">Loading biography...</p>
                    <div class="actor-meta">
                        <span id="actorBorn"></span>
                        <span id="actorPlace"></span>
                    </div>
                </div>
            </div>
        </div>

        <h2 class="section-title">🎬 Known For</h2>
        <div id="actorMovies" class="movie-list"></div>
    </div>
    `;

    showLoadingBar();

    try {
        const [person, credits] = await Promise.all([
            getPersonDetails(actorId),
            getPersonMovieCredits(actorId)
        ]);

        // Update Profile
        document.getElementById("actorName").innerText = person.name;
        document.getElementById("actorBio").innerText = person.biography || "No biography available.";
        document.getElementById("actorImage").src = person.profile_path
            ? `${CONFIG.imageBaseUrl}/w300${person.profile_path}`
            : "https://via.placeholder.com/200x300?text=No+Image";

        if (person.birthday) {
            document.getElementById("actorBorn").innerText = `🎂 Born: ${person.birthday}`;
        }
        if (person.place_of_birth) {
            document.getElementById("actorPlace").innerText = `📍 ${person.place_of_birth}`;
        }

        // Filter and Sort Movies (Popularity desc)
        const movies = credits.cast
            .filter(m => m.poster_path && m.vote_average > 0)
            .sort((a, b) => b.popularity - a.popularity);

        const moviesDiv = document.getElementById("actorMovies");
        if (movies.length === 0) {
            moviesDiv.innerHTML = "<p>No movies found.</p>";
        } else {
            movies.forEach(movie => {
                const card = createMovieCard(movie);
                card.onclick = () => window.location.hash = `#/movie/${movie.id}`;
                moviesDiv.appendChild(card);
            });
        }

    } catch (e) {
        console.error("Error loading actor:", e);
        app.innerHTML = "<div class='container' style='padding-top:100px;'><h2>Error loading actor profile.</h2></div>";
    } finally {
        hideLoadingBar();
    }
}
