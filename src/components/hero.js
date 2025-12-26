import { CONFIG } from '../config.js';
import { openModal } from './modal.js';

export function setupHeroSection(movie) {
    const heroSection = document.getElementById("heroSection");
    const title = document.getElementById("heroTitle");
    const overview = document.getElementById("heroOverview");
    const trailerBtn = document.getElementById("heroTrailerBtn");
    const detailsBtn = document.getElementById("heroDetailsBtn");

    if (!heroSection) return;

    // Set Background
    const backdropUrl = `${CONFIG.imageBaseUrl}/original${movie.backdrop_path}`;
    heroSection.style.backgroundImage = `url('${backdropUrl}')`;

    // Set Content
    title.innerText = movie.title;
    overview.innerText = movie.overview;

    // Set Actions
    // Note: watchTrailer needs to be imported or passed if it's not global.
    // For now, we'll assume it's handled via event delegation or a separate module import if needed.
    // Ideally, we should import the trailer logic here or pass it as a callback.
    // Let's assume we'll attach a custom event or import it.
    // For simplicity in this refactor step, we'll use a placeholder or import if available.
    // Actually, let's make sure we export a function to handle trailer clicks or similar.

    trailerBtn.onclick = () => {
        const event = new CustomEvent('watchTrailer', { detail: { movieId: movie.id } });
        document.dispatchEvent(event);
    };

    detailsBtn.onclick = () => {
        window.location.hash = `#/movie/${movie.id}`;
    };
}
