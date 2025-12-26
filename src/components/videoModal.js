export function openVideoModal(videoKey) {
    // Check if modal already exists
    let modal = document.getElementById("videoModal");
    if (!modal) {
        modal = document.createElement("div");
        modal.id = "videoModal";
        modal.className = "video-modal";
        modal.innerHTML = `
            <div class="video-modal-content">
                <span class="close-video-btn">&times;</span>
                <div class="video-container">
                    <iframe id="videoFrame" width="100%" height="100%" frameborder="0" allowfullscreen></iframe>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        // Close logic
        modal.querySelector(".close-video-btn").onclick = closeVideoModal;
        modal.onclick = (e) => {
            if (e.target === modal) closeVideoModal();
        };
    }

    const iframe = modal.querySelector("#videoFrame");
    iframe.src = `https://www.youtube.com/embed/${videoKey}?autoplay=1&rel=0`;

    modal.style.display = "flex";
    document.body.style.overflow = "hidden"; // Prevent background scrolling
}

export function closeVideoModal() {
    const modal = document.getElementById("videoModal");
    if (modal) {
        const iframe = modal.querySelector("#videoFrame");
        iframe.src = ""; // Stop video
        modal.style.display = "none";
        document.body.style.overflow = "";
    }
}
