/**
  * @description Exports a function that ensures our directory structure is in place.
  * @param {string} root - The root directory to ensure the directories are in place.
  * @param {boolean} envy - Whether or not to ensure the theme-envy specific directories.
  * @example
  * ensureDirectories({ root: ThemeEnvy.themePath, envy: true })
  * @returns {Void}
  */

const fs = require('fs-extra')
const path = require('path')

const directories = ['assets', 'config', 'layout', 'locales', 'sections', 'snippets', 'templates']
const envyDirectories = ['theme-envy/elements', 'theme-envy/features', 'theme-envy/partials', 'theme-envy/schema']
function ensureDirectory(root, dir) {
  fs.ensureDirSync(path.resolve(root, dir))
}
module.exports = {
  directories,
  envyDirectories,
  ensureDirectories({ root = ThemeEnvy.themePath, envy = false }) {
    directories.forEach(dir => ensureDirectory(root, dir))
    if (!envy) return
    envyDirectories.forEach(dir => ensureDirectory(root, dir))
  }
}
