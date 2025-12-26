export function debounce(func, wait) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

export function showLoadingBar() {
    const bar = document.getElementById("progressBar");
    if (bar) bar.classList.add("active");
}

export function hideLoadingBar() {
    const bar = document.getElementById("progressBar");
    if (bar) {
        setTimeout(() => {
            bar.classList.remove("active");
        }, 500);
    }
}

export function getYearFromDate(dateString) {
    return dateString ? dateString.slice(0, 4) : "N/A";
}

export function formatRuntime(minutes) {
    return minutes ? `${Math.floor(minutes / 60)}h ${minutes % 60}m` : "N/A";
}
