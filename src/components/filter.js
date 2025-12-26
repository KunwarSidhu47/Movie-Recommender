import { state, updateState, resetState } from '../state.js';
import { displayMessage } from './toast.js';
import { showLoadingBar, hideLoadingBar } from '../utils.js';
import { discoverMovies, searchMovies } from '../api/tmdb.js';

// We need a way to trigger the main display update.
// In a framework, this would be reactive. Here, we'll accept a callback or dispatch an event.
// Let's use a callback pattern for simplicity in this refactor.

export function setupFilters(updateDisplayCallback) {
    const applyBtn = document.querySelector("button[onclick='applyPowerFilter()']");
    // We need to replace the inline onclick with an event listener in main.js or here.
    // Since we are refactoring, we should attach listeners here if possible, but we need to find the element.
    // The HTML still has onclick attributes. We will remove them in the final step or override them.
    // For now, let's export the logic functions.
}

export async function applyPowerFilter(updateDisplayCallback) {
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

    updateState({
        mode: 'filter',
        page: 1,
        filterParams: { region, genre, year, rating }
    });

    try {
        showLoadingBar();
        // toggleCarousels(false); // We need to handle this visibility
        const data = await discoverMovies({ region, genre, year, rating });
        updateDisplayCallback(data.results, "⚡ Custom Filter Results", true); // true = hide carousels
    } catch (e) {
        console.error(e);
        displayMessage("Error fetching filtered movies.", "error");
    } finally {
        hideLoadingBar();
    }
}

export async function handleSearch(query, updateDisplayCallback) {
    if (!query) return;
    showLoadingBar();
    updateState({ mode: 'search', query: query, page: 1 });

    try {
        const data = await searchMovies(query);
        updateDisplayCallback(data.results, `🔍 Results for "${query}"`, true);
    } catch (e) {
        console.error(e);
        displayMessage("Error searching movies.", "error");
    } finally {
        hideLoadingBar();
    }
}

export async function handleRegionSearch(regionCode, regionName, updateDisplayCallback) {
    showLoadingBar();
    updateState({ mode: 'region', query: regionCode, page: 1 });
    try {
        const data = await discoverMovies({ region: regionCode });
        updateDisplayCallback(data.results, `Movies from ${regionName}`, true);
    } catch (e) {
        console.error(e);
    } finally {
        hideLoadingBar();
    }
}

import { MOODS } from '../config/moods.js';

export async function handleMoodSearch(moodId, updateDisplayCallback) {
    const mood = MOODS.find(m => m.id === moodId);
    if (!mood) return;

    showLoadingBar();
    updateState({ mode: 'mood', query: moodId, page: 1 });

    try {
        const data = await discoverMovies({ genre: mood.genres });
        updateDisplayCallback(data.results, `🔮 Vibe: ${mood.label} ${mood.emoji}`, true);
    } catch (e) {
        console.error(e);
    } finally {
        hideLoadingBar();
    }
}
