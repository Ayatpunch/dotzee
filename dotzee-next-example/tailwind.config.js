/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./app/**/*.{js,ts,jsx,tsx}",
        "./components/**/*.{js,ts,jsx,tsx}",
        "./stores/**/*.{js,ts,jsx,tsx}"
    ],
    darkMode: 'media',
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#7c3aed',
                    light: '#9867f9',
                    dark: '#6027c5'
                },
                secondary: {
                    DEFAULT: '#10b981',
                    light: '#34d399',
                    dark: '#059669'
                }
            },
            animation: {
                'spin-slow': 'spin 3s linear infinite',
            }
        },
    },
    plugins: [],
}; 