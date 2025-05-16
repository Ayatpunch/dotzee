/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            fontFamily: {
                'inter': ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
            },
            colors: {
                'purple': {
                    50: '#f5f3ff',
                    100: '#ede9fe',
                    200: '#ddd6fe',
                    300: '#c4b5fd',
                    400: '#a78bfa',
                    500: '#8b5cf6',
                    600: '#7c3aed',
                    700: '#6d28d9',
                    800: '#5b21b6',
                    900: '#4c1d95',
                    '900/30': 'rgba(76, 29, 149, 0.3)',
                },
            },
            typography: {
                DEFAULT: {
                    css: {
                        maxWidth: '100%',
                    },
                },
            },
            animation: {
                'pulse-slow': 'pulse 5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'text-shimmer': 'shimmer 2.5s ease-in-out infinite',
                'slowly-drift': 'drift 60s linear infinite',
                'slowly-shift': 'shift 10s ease-in-out infinite',
            },
            keyframes: {
                shimmer: {
                    '0%, 100%': { opacity: 1 },
                    '50%': { opacity: 0.7 },
                },
                drift: {
                    '0%': {
                        transform: 'rotate(12deg) translateY(0%)'
                    },
                    '100%': {
                        transform: 'rotate(12deg) translateY(-20%)'
                    }
                },
                shift: {
                    '0%, 100%': {
                        transform: 'translateY(0)'
                    },
                    '50%': {
                        transform: 'translateY(-5px)'
                    }
                }
            }
        },
    },
    plugins: [
        require('@tailwindcss/typography'),
    ],
} 