export function displayMessage(text, type = "success") {
    const container = document.getElementById("toast-container");
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.innerText = text;

    // Icon based on type
    const icon = type === "error" ? "❌" : "✅";
    toast.innerHTML = `<span>${icon}</span> ${text}`;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = "0";
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}
