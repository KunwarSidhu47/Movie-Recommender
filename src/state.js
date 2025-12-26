export const state = {
    mode: 'trending', // Modes: 'trending', 'search', 'genre', 'region', 'actor', 'filter'
    query: null,      // Stores the Search Term, Genre ID, Region Code, or Actor ID
    page: 1,          // Current Page Number
    filterParams: {}, // Stores complex filter data (Region + Genre + Year)
    results: [],      // Store current results for sorting
    devMode: false    // Dev Mode State
};

export function updateState(updates) {
    Object.assign(state, updates);
}

export function resetState(mode = 'trending') {
    state.mode = mode;
    state.query = null;
    state.page = 1;
    state.filterParams = {};
    state.results = [];
}
