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
                background: {
                    light: '#ffffff',
                    dark: '#1a1a1a',
                },
                text: {
                    light: '#1f2937',
                    dark: '#e5e5e5',
                },
            }
        },
    },
    plugins: [],
}
