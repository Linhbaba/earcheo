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
        background: '#050b14',
        primary: '#00f3ff',
        alert: '#ffae00',
        surface: '#0f172a', 
        surface_highlight: '#1e293b',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        display: ['Exo 2', 'sans-serif'],
        mono: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'], // Inter všude
      },
      letterSpacing: {
        widest: '.25em',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
