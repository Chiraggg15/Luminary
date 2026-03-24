/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bgStart: '#0f172a',
        bgEnd: '#1e1b4b',
        primary: '#a855f7',
        primaryHover: '#9333ea',
      },
      backgroundColor: {
        glass: 'rgba(255, 255, 255, 0.03)',
        glassHover: 'rgba(255, 255, 255, 0.08)',
      },
      borderColor: {
        glass: 'rgba(255, 255, 255, 0.1)',
        glassFocus: 'rgba(255, 255, 255, 0.25)',
      }
    },
  },
  plugins: [],
}
