/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                primary: "#064e3b", // Forest Green
                secondary: "#14532d",
                accent: "#b45309", // Warm Amber
                surface: "#fbfbfb",
                darkSurface: "#1e1e1e", // Main dark background
                darkElevated: "#2d2d2d", // Elevated surfaces (cards, modals)
                darkBorder: "#3a3a3a", // Borders in dark mode
                muted: "#64748b",
            },
            fontFamily: {
                sans: ['Inter', 'Outfit', 'sans-serif'],
            }
        },
    },
    plugins: [],
}
