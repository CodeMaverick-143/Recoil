/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "#0f172a", // Deep slate
                primary: "#ef4444",    // Neon red
                surface: "#1e293b",    // Lighter slate
                muted: "#94a3b8",      // Muted text
            },
            fontFamily: {
                mono: ['"JetBrains Mono"', "monospace"],
            },
        },
    },
    plugins: [],
}
