/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f5ff',
          100: '#e0ebff',
          200: '#c7d9fe',
          300: '#a3bffe',
          400: '#7599fc',
          500: '#4c73f7',
          600: '#254ceb',
          700: '#1d3acb',
          800: '#1c31a4',
          900: '#1b2d81',
          950: '#111b4e',
        },
        navy: {
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        card: '0 2px 12px -2px rgba(0, 0, 0, 0.06), 0 4px 16px -2px rgba(0, 0, 0, 0.04)',
        cardHover: '0 12px 28px -4px rgba(0, 0, 0, 0.1), 0 8px 12px -4px rgba(0, 0, 0, 0.06)',
      },
    },
  },
  plugins: [],
};
