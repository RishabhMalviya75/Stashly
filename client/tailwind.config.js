/**
 * Tailwind CSS Configuration
 * ==========================
 * 
 * Design Style: Meta/Facebook-inspired
 * - Clean blues for primary actions
 * - Neutral grays for backgrounds
 * - No purple, no crypto colors
 * - Clean, professional aesthetic
 */

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            // Meta/Facebook inspired color palette
            colors: {
                // Primary blue - Facebook/Meta signature blue
                primary: {
                    50: '#e7f3ff',
                    100: '#c3dffc',
                    200: '#9ecbf9',
                    300: '#79b7f6',
                    400: '#54a3f3',
                    500: '#1877f2',  // Facebook blue
                    600: '#166fe0',
                    700: '#1264c7',
                    800: '#0e4f9e',
                    900: '#0a3a75',
                    950: '#06254d',
                },
                // Neutral colors - clean grays
                neutral: {
                    50: '#f7f8fa',
                    100: '#f0f2f5',  // Facebook background gray
                    150: '#e4e6eb',
                    200: '#dadde1',
                    300: '#bec3c9',
                    400: '#8a8d91',
                    500: '#65676b',  // Secondary text
                    600: '#4b4f54',
                    700: '#3a3b3c',  // Dark mode card
                    800: '#242526',  // Dark mode background
                    850: '#1c1d1e',
                    900: '#18191a',  // Dark mode deep
                    950: '#0d0e0f',
                },
                // Success - green
                success: {
                    light: '#e6f4ea',
                    DEFAULT: '#31a24c',
                    dark: '#237a38',
                },
                // Warning - orange/yellow
                warning: {
                    light: '#fff4e5',
                    DEFAULT: '#f7b928',
                    dark: '#c9961f',
                },
                // Error - red
                error: {
                    light: '#ffebe9',
                    DEFAULT: '#fa3e3e',
                    dark: '#c12e2e',
                },
                // Resource type colors - professional, non-purple palette
                bookmark: '#1877f2',   // Blue
                prompt: '#0e8a5f',     // Teal/Green
                code: '#2d8a3e',       // Green
                document: '#e16b16',   // Orange
                note: '#1877f2',       // Blue
            },
            // Typography
            fontFamily: {
                sans: ['Segoe UI', 'Helvetica Neue', 'Arial', 'sans-serif'],
                mono: ['SF Mono', 'Consolas', 'Monaco', 'monospace'],
            },
            // Shadows - soft and subtle
            boxShadow: {
                'soft': '0 1px 2px rgba(0, 0, 0, 0.1)',
                'card': '0 1px 2px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.05)',
                'elevated': '0 2px 8px rgba(0, 0, 0, 0.1), 0 4px 16px rgba(0, 0, 0, 0.08)',
                'dropdown': '0 12px 28px 0 rgba(0, 0, 0, 0.2), 0 2px 4px 0 rgba(0, 0, 0, 0.1)',
            },
            // Border radius - Meta uses rounded corners
            borderRadius: {
                'DEFAULT': '8px',
                'lg': '12px',
                'xl': '16px',
                '2xl': '20px',
                'full': '9999px',
            },
            // Animations
            animation: {
                'fade-in': 'fadeIn 0.15s ease-out',
                'slide-up': 'slideUp 0.2s ease-out',
                'scale-in': 'scaleIn 0.15s ease-out',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { transform: 'translateY(8px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                scaleIn: {
                    '0%': { transform: 'scale(0.95)', opacity: '0' },
                    '100%': { transform: 'scale(1)', opacity: '1' },
                },
            },
        },
    },
    plugins: [],
}
