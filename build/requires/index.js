/**
 * @file Require all files in the requires directory
 */

require('./globals')

const requires = [
  './assets',
  './config',
  './locales',
  './scripts',
  './snippets',
  './styles',
  './templates',
]

// iterate over requires so we can fire progress one at a time
requires.forEach((requirePath) => {
  require(requirePath)
  ThemeEnvy.progress.increment('requires', 1)
})
