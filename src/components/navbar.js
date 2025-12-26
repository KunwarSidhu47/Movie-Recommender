import { toggleDevMode } from './devMode.js';

export function createNavbar() {
  const nav = document.createElement("nav");
  nav.className = "navbar glass-panel";

  nav.innerHTML = `
    <div class="nav-logo">
      <a href="#/">🎬 Movie Recommender <span class="highlight">Pro</span></a>
    </div>
    <div class="nav-links">
      <a href="#/" class="nav-link" data-link="home">Home</a>
      <a href="#/discover" class="nav-link" data-link="discover">Discover</a>
      <a href="#/watchlist" class="nav-link" data-link="watchlist">Watchlist</a>
    </div>
    <div class="nav-actions">
      <button id="devModeToggle" class="dev-mode-btn">👨‍💻 Dev Mode: OFF</button>
    </div>
  `;

  // Attach Dev Mode Listener
  const devBtn = nav.querySelector("#devModeToggle");
  devBtn.onclick = () => toggleDevMode();

  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  });

  return nav;
}

export function updateActiveLink() {
  const hash = window.location.hash || "#/";
  const links = document.querySelectorAll(".nav-link");

  links.forEach(link => {
    const href = link.getAttribute("href");
    if (hash === href) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  });
}
