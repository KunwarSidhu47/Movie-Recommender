import { state } from '../state.js';
import { displayMessage } from './toast.js';

export function toggleDevMode(renderCallback) {
    state.devMode = !state.devMode;
    const btn = document.getElementById("devModeToggle");

    if (state.devMode) {
        btn.innerText = "👨‍💻 Dev Mode: ON";
        btn.classList.add("active");
        displayMessage("💻 Dev Mode Activated: Inspecting API Data...");
    } else {
        btn.innerText = "👨‍💻 Dev Mode: OFF";
        btn.classList.remove("active");
        displayMessage("🎬 Returning to Cinema Mode");
    }

    // Trigger re-render to show/hide overlays
    if (renderCallback) renderCallback();
}
