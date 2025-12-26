export class Router {
    constructor(routes) {
        this.routes = routes;
        this.app = document.getElementById("app");
        window.addEventListener("hashchange", this.handleRoute.bind(this));
        window.addEventListener("load", this.handleRoute.bind(this));
    }

    async handleRoute() {
        const hash = window.location.hash || "#/";
        const path = hash.substring(1).split("?")[0]; // Remove # and ignore query params

        // Find matching route
        let route = this.routes[path];
        let params = {};

        // Handle dynamic routes (e.g., #/movie/:id)
        if (!route) {
            for (const key in this.routes) {
                if (key.includes(":")) {
                    const routeParts = key.split("/");
                    const pathParts = path.split("/");

                    if (routeParts.length === pathParts.length) {
                        let match = true;
                        let tempParams = {};

                        for (let i = 0; i < routeParts.length; i++) {
                            if (routeParts[i].startsWith(":")) {
                                tempParams[routeParts[i].slice(1)] = pathParts[i];
                            } else if (routeParts[i] !== pathParts[i]) {
                                match = false;
                                break;
                            }
                        }

                        if (match) {
                            route = this.routes[key];
                            params = tempParams;
                            break;
                        }
                    }
                }
            }
        }

        if (route) {
            this.app.innerHTML = ""; // Clear current view
            await route(params);
            window.scrollTo(0, 0);
        } else {
            console.log("404 Not Found");
            window.location.hash = "#/";
        }
    }

    navigate(path) {
        window.location.hash = path;
    }
}
