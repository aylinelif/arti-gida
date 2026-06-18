/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        brandGreen: '#16a34a',
        brandLight: '#f0fdf4',
        brandDark: '#14532d'
      }
    },
  },
  plugins: [],
}