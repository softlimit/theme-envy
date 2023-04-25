/**
 * @private
 * @type {import('tailwindcss').Config}
 */
const path = require('path')
const ThemeEnvy = require('./theme.config.js')

const config = {
  content: [
    path.resolve(ThemeEnvy.themePath, '**/*.{liquid,js}'),
  ],
  theme: {
    extend: {},
  },
  screens: ThemeEnvy.breakpoints,
  plugins: [],
}

// merge parentTheme tailwind config if it exists
if (ThemeEnvy.parentTheme?.path) {
  const parentTailwind = require(path.join(path.dirname(require.resolve(ThemeEnvy.parentTheme.path)), 'tailwind.config.js'))
  // deep merge parentTheme tailwind config with child theme tailwind config
  if (parentTailwind) {
    config.theme.extend = Object.assign(config.theme.extend, parentTailwind.theme.extend)
    config.plugins = config.plugins.concat(parentTailwind.plugins)
    config.content = config.content.concat(parentTailwind.content)
  }
}

module.exports = config
