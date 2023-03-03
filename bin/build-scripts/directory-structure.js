/*
  Exports a function that ensures our directory structure is in place.
  @param {string} root - The root directory to ensure the directories are in place.
  @param {boolean} envy - Whether or not to ensure the _features and _elements directories.
  Example: const { ensureDirectories } = require('./directory-structure')
  ensureDirectories({ root: path.resolve(process.cwd(), 'src'), envy: true })
*/
const fs = require('fs-extra')
const path = require('path')

const directories = ['assets', 'config', 'layout', 'locales', 'sections', 'snippets', 'templates']
const envyDirectories = ['_features', '_elements']
function ensureDirectory(root, dir) {
  fs.ensureDirSync(path.resolve(root, dir))
}
module.exports = {
  directories,
  envyDirectories,
  ensureDirectories({ root = path.resolve(process.cwd(), 'src'), envy = false }) {
    directories.forEach(dir => ensureDirectory(root, dir))
    if (!envy) return
    envyDirectories.forEach(dir => ensureDirectory(root, dir))
  }
}
