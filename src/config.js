export const CONFIG = {
    apiKey: "d7d36abcf57738dbcb3b2575c413b035", // TMDb API Key
    omdbApiKey: "trilogy", // OMDB API Key (Free tier)
    userRegion: "IN", // Default region
    apiBaseUrl: "https://api.themoviedb.org/3",
    imageBaseUrl: "https://image.tmdb.org/t/p",
};

export const GENRE_MAP = {
    action: 28, adventure: 12, animation: 16, comedy: 35, crime: 80,
    documentary: 99, drama: 18, family: 10751, fantasy: 14, history: 36,
    horror: 27, music: 10402, mystery: 9648, romance: 10749, sci_fi: 878, thriller: 53
};

export const MOOD_MAP = {
    happy: 35,          // Comedy
    sad: 18,            // Drama
    adrenaline: 28,     // Action
    romantic: 10749,    // Romance
    scared: 27,         // Horror
    curious: 9648       // Mystery
};
