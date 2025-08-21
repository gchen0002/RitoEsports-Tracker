/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./public/*.html",
    "./dist/*.html",
    "./dist/*.js",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Enable class-based dark mode
  theme: {
    extend: {
      colors: {
        // Custom colors for the extension
        primary: {
          50: '#eff6ff',
          500: '#007bff',
          600: '#0056b3',
          700: '#004494',
        },
        secondary: {
          50: '#f8f9fa',
          100: '#e9ecef',
          200: '#dee2e6',
          300: '#ced4da',
          400: '#adb5bd',
          500: '#6c757d',
          600: '#495057',
          700: '#343a40',
          800: '#212529',
        },
        live: {
          50: '#fef2f2',
          500: '#dc3545',
          600: '#c82333',
          700: '#a71e2a',
        },
        success: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          500: '#06b6d4',
          600: '#0891b2',
        },
        background: {
          light: '#f4f4f9',
          dark: '#1a1a1a',
        }
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
      },
      width: {
        'extension': '380px',
      },
      animation: {
        'pulse-live': 'pulse-live 2s infinite',
      },
      keyframes: {
        'pulse-live': {
          '0%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.7', transform: 'scale(1.2)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        }
      }
    },
  },
  plugins: [],
}