/**
  * Get all files from the parent theme that are not in the child
  * @private
  * @param {function} func - function to get files with a glob, should return an array of file paths
  * @param {array} childFiles - array of file paths from the child theme that we check against
  * @returns {array} - array of file paths from the parent theme that are not in the child
*/
const path = require('path')
const { directories } = require('#EnsureDirectories')
// sets resolved parent theme path
require('./index.js')

module.exports = (func, childFiles, type) => {
  const childRelative = childFiles.map(file => path.relative(ThemeEnvy.themePath, file))
  // get all files from the parent theme, using only elements and features directories in parent theme
  let only = [...ThemeEnvy.parentTheme.elements, ...ThemeEnvy.parentTheme.features]

  if (type === 'elements') {
    only = ThemeEnvy.parentTheme.elements
  }
  if (type === 'features') {
    only = ThemeEnvy.parentTheme.features
  }
  if (type === 'schema') {
    only.push(path.resolve(ThemeEnvy.parentTheme.path, 'src/theme-envy/schema'))
  }
  if (type === 'liquid') {
    only.push(...directories.map(dir => path.resolve(ThemeEnvy.parentTheme.path, 'src', dir)))
  }
  if (type === 'sectionGroups') {
    only.push(path.resolve(ThemeEnvy.parentTheme.path, 'src/sections'))
  }
  if (type === 'config') {
    only.push(path.resolve(ThemeEnvy.parentTheme.path, 'src/config'))
  }
  if (type === 'locales') {
    only.push(path.resolve(ThemeEnvy.parentTheme.path, 'src/locales'))
  }
  if (type === 'templates') {
    only.push(path.resolve(ThemeEnvy.parentTheme.path, 'src/templates'))
  }
  if (type === 'criticalCSS') {
    only.push(path.resolve(ThemeEnvy.parentTheme.path, 'src/styles'))
  }

  return func(ThemeEnvy.parentTheme.path, only).filter(file => !childRelative.includes(path.relative(ThemeEnvy.parentTheme.path, file)))
}
