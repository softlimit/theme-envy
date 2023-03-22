/**
 * @private
 * @type {import('tailwindcss').Config}
 */
const theme = require('./theme.config.js')
const path = require('path')
const ThemeEnvy = require('./theme.config.js')

module.exports = {
  content: [path.resolve(ThemeEnvy.themePath, '**/*.{liquid,js}')],
  theme: {
    extend: {},
  },
  screens: theme.breakpoints,
  plugins: [],
}
