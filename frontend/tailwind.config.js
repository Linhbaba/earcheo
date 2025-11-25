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
        // Deep Space Grey - Pozadí
        background: '#050b14', // Darker for better contrast with neon
        // Neon Cyan - Data/Aktivní prvky
        primary: '#00f3ff',
        // Amber Orange - Detekce/Výstrahy
        alert: '#ffae00',
        // UI Surface colors
        surface: '#0f172a', 
        surface_highlight: '#1e293b',
      },
      fontFamily: {
        sans: ['Share Tech Mono', 'ui-monospace', 'SFMono-Regular'], // Default text is now tech mono
        display: ['Orbitron', 'sans-serif'], // For headers
        mono: ['Share Tech Mono', 'monospace'],
      },
      letterSpacing: {
        widest: '.25em',
      },
    },
  },
  plugins: [],
}
