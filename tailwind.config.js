/** @type {import('tailwindcss').Config} */
const theme = require('./theme.config.js')
module.exports = {
  content: ['./src/**/*.{liquid,js}'],
  theme: {
    extend: {},
  },
  screens: theme.breakpoints,
  plugins: [],
}
