# 🎬 Movie Recommender Pro - Project Documentation

## 📖 Overview
**Movie Recommender Pro** is a modern, single-page web application (SPA) designed to help users discover, explore, and track movies. Built with **Vanilla JavaScript**, it leverages the **TMDb API** for comprehensive movie data and the **OMDB API** for Rotten Tomatoes ratings. The application features a premium, "Midnight Luxe" aesthetic with glassmorphism effects, dynamic animations, and a responsive design.

## ✨ Key Features

### 🔍 Discovery & Search
*   **Trending Dashboard**: Instantly view the top trending movies of the week with a Netflix-style hero section.
*   **Smart Search**: Real-time search by movie title with debouncing for performance.
*   **Power Filter**: Advanced filtering options to find movies by **Region**, **Genre**, **Year**, and **Minimum Rating**.
*   **Mood Picker**: Curated movie recommendations based on user mood (e.g., "Happy", "Adrenaline", "Curious").
*   **Category Carousels**: Horizontal scrolling lists for popular genres like Sci-Fi, Action, and Drama.

### 🎥 Rich Movie Details
*   **Immersive View**: Full-screen backdrop headers, poster art, and detailed metadata.
*   **Ratings**:
    *   **TMDb Score**: User score from The Movie Database.
    *   **Rotten Tomatoes**: Critic score fetched from OMDB (with caching for performance).
    *   **User Rating**: Interactive 5-star rating system with local storage persistence.
*   **Streaming Availability**: Displays OTT platforms (Netflix, Prime, etc.) where the movie is available to stream in the user's region.
*   **Cast Profiles**: Top cast members with circular profile images; clickable to view actor filmography.
*   **Trailers**: Integrated YouTube trailer playback in a modal.
*   **Similar Movies**: Recommendations based on the currently viewed movie.

### 👤 User Personalization
*   **Watchlist**: Save movies to a local watchlist.
*   **Watched History**: Mark movies as watched and track your viewing history.
*   **Local Storage**: All user data (ratings, watchlist) is persisted locally in the browser.

### ⚡ Performance & UX
*   **SPA Architecture**: Seamless navigation without page reloads using a custom Router.
*   **Optimized Loading**:
    *   **Skeleton Screens**: Placeholders while data loads.
    *   **Lazy/Async Fetching**: Critical content loads first; ratings and secondary data load in the background.
    *   **Caching**: Rotten Tomatoes ratings are cached to minimize API calls.
*   **Responsive Design**: Fully optimized for desktop, tablet, and mobile devices.

## 🏗️ Technical Architecture

The project is built using a **Component-Based Architecture** with **Vanilla JavaScript** (ES6+). It avoids heavy frameworks to maintain high performance and lightweight assets.

### Core Modules
*   **`src/main.js`**: Application entry point; initializes the router and global components.
*   **`src/router.js`**: Handles client-side routing (hash-based) to render different views (`/`, `/movie/:id`, `/discover`, etc.).
*   **`src/state.js`**: Simple state management for shared data.
*   **`src/api/tmdb.js`**: Centralized service for all API requests (TMDb & OMDB).

### Directory Structure
```
Movie_Recommender/
├── index.html              # Main HTML entry point
├── style.css               # Global styles (CSS Variables, Layout, Components)
├── src/
│   ├── main.js             # App initialization
│   ├── router.js           # Routing logic
│   ├── config.js           # API Keys and Configuration
│   ├── utils.js            # Helper functions (Debounce, Formatting)
│   ├── api/
│   │   └── tmdb.js         # API Fetching logic
│   ├── components/         # Reusable UI Components
│   │   ├── navbar.js       # Navigation bar
│   │   ├── hero.js         # Hero section
│   │   ├── movieCard.js    # Movie card component
│   │   ├── modal.js        # Quick-view modal
│   │   ├── rating.js       # Star rating component
│   │   ├── carousel.js     # Horizontal movie lists
│   │   └── ...
│   └── views/              # Page Views
│       ├── home.js         # Landing page
│       ├── discover.js     # Search & Filter page
│       ├── movie.js        # Movie Details page
│       ├── actor.js        # Actor Profile page
│       └── watchlist.js    # User Watchlist page
```

## 🚀 Setup & Installation

1.  **Prerequisites**: A modern web browser (Chrome, Firefox, Safari).
2.  **Clone/Download**: Download the project files to your local machine.
3.  **Configuration**:
    *   Open `src/config.js`.
    *   Ensure valid API Keys are present for `apiKey` (TMDb) and `omdbApiKey` (OMDB).
4.  **Run**:
    *   Since this project uses ES6 Modules (`import`/`export`), it **must** be served via a local server (opening `index.html` directly will cause CORS errors).
    *   **VS Code**: Right-click `index.html` and select "Open with Live Server".
    *   **Python**: Run `python3 -m http.server` in the project root and visit `http://localhost:8000`.
    *   **Node**: Use `http-server` or similar packages.

## 🎨 Design System

*   **Theme**: "Midnight Luxe" - Deep navy/black backgrounds with gold and red accents.
*   **Typography**: `Playfair Display` (Headings) and `Inter` (Body).
*   **Effects**:
    *   **Glassmorphism**: Translucent panels with blur effects.
    *   **3D Tilt**: Interactive tilt effect on movie cards.
    *   **Animations**: Smooth fade-ins, slide-ups, and hover transitions.

## 🛠️ Recent Improvements

*   **Performance**: Implemented non-blocking async fetching for external ratings to prevent UI freeze.
*   **UI Polish**:
    *   **Provider Names**: Added OTT provider names under logos.
    *   **Cast Photos**: Added circular cast profile images.
    *   **Rating Cancellation**: Enhanced rating cancellation (toggle/clear).
    *   **Refined Styling**: Refined styling for a more professional look.

---
*Documentation generated by Antigravity AI*
