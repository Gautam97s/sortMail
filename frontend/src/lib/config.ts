/**
 * Client-side safe configuration utility.
 * Handles environment variables with validation and safe defaults.
 */

export const config = {
    /**
     * The root URL of the backend API.
     * Defaults to the production URL if NEXT_PUBLIC_API_URL is missing.
     */
    get apiUrl() {
        const url = process.env.NEXT_PUBLIC_API_URL;
        
        if (!url) {
            // Log warning but don't hardcrash yet to allow error state in UI
            if (process.env.NODE_ENV === "development") {
                console.warn("⚠️ NEXT_PUBLIC_API_URL is not set. API calls will default to local origin.");
            }
            return ""; // Let's return empty to allow relative fetches if desired, or we can use a hard fallback
        }
        
        // Ensure NO trailing slash
        return url.replace(/\/$/, "");
    },

    isDev: process.env.NODE_ENV === "development",
    
    auth: {
        googleEndpoint: "/api/auth/google",
        logoutEndpoint: "/api/auth/logout",
        sessionEndpoint: "/api/auth/me",
    }
};

/**
 * Helper to construct an absolute API URL.
 */
export function getApiUrl(path: string): string {
    const base = config.apiUrl;
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    
    // If no base URL, we assume the environment is misconfigured or relative fetches are intentional
    if (!base) return cleanPath;
    
    return `${base}${cleanPath}`;
}
