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
                    dark: '#0f0f12',
                },
                text: {
                    light: '#1f2937',
                    dark: '#e5e5e5',
                },
                deepblue: {
                    50: '#eff6ff',
                    100: '#dbeafe',
                    500: '#2563eb',
                    600: '#2563eb',
                    700: '#1d4ed8',
                }
            },
            fontFamily: {
                sans: ['Pretendard', 'Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', "Segoe UI", 'Roboto', "Helvetica Neue", 'Arial', "Noto Sans", 'sans-serif'],
            },
            boxShadow: {
                'premium': '0 10px 30px -10px rgba(0, 0, 0, 0.1)',
                'premium-dark': '0 10px 40px -15px rgba(0, 0, 0, 0.5)',
            }
        },
    },
    plugins: [],
}
