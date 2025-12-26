export function getUserRating(movieId) {
    const ratings = JSON.parse(localStorage.getItem("userRatings")) || {};
    return ratings[movieId] || 0;
}

export function setUserRating(movieId, rating) {
    const ratings = JSON.parse(localStorage.getItem("userRatings")) || {};
    if (rating === 0) {
        delete ratings[movieId];
    } else {
        ratings[movieId] = rating;
    }
    localStorage.setItem("userRatings", JSON.stringify(ratings));
}

export function createRatingStars(movieId, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const currentRating = getUserRating(movieId);
    container.innerHTML = "";
    container.className = "user-rating-stars";

    for (let i = 1; i <= 5; i++) {
        const star = document.createElement("span");
        star.innerHTML = i <= currentRating ? "★" : "☆";
        star.className = "rating-star";
        star.dataset.value = i;
        star.title = `Rate ${i} stars`;

        star.onclick = () => {
            // Toggle off if clicking the same rating
            const newRating = (i === currentRating) ? 0 : i;
            setUserRating(movieId, newRating);
            createRatingStars(movieId, containerId); // Re-render
        };

        container.appendChild(star);
    }

    const label = document.createElement("span");
    label.className = "rating-label";
    label.innerText = currentRating > 0 ? `You rated: ${currentRating}/5` : "Rate this movie";
    label.style.marginLeft = "10px";
    container.appendChild(label);

    // Add Clear Button if rated
    if (currentRating > 0) {
        const clearBtn = document.createElement("span");
        clearBtn.innerHTML = " &times;"; // Multiplication sign (x)
        clearBtn.title = "Clear rating";
        clearBtn.className = "clear-rating-btn";
        clearBtn.style.cursor = "pointer";
        clearBtn.style.marginLeft = "8px";
        clearBtn.style.color = "#ef4444";
        clearBtn.style.fontWeight = "bold";

        clearBtn.onclick = () => {
            setUserRating(movieId, 0);
            createRatingStars(movieId, containerId);
        };
        container.appendChild(clearBtn);
    }
}
