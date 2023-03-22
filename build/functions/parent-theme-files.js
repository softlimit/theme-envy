/**
  * Get all files from the parent theme that are not in the child
  * @private
  * @param {function} func - function to get files with a glob, should return an array of file paths
  * @param {array} childFiles - array of file paths from the child theme that we check against
  * @returns {array} - array of file paths from the parent theme that are not in the child
*/
const path = require('path')
const { directories } = require('#EnsureDirectories')

module.exports = (func, childFiles, type) => {
  const childRelative = childFiles.map(file => path.relative(ThemeEnvy.themePath, file))
  // get all files from the parent theme, using only directories listed in ThemeConfig
  const only = [...ThemeEnvy.parentTheme.elements, ...ThemeEnvy.parentTheme.features]
  if (type === 'schema') {
    only.push('_schema')
  }
  if (type === 'liquid') {
    only.push(...directories.map(dir => path.resolve(ThemeEnvy.parentTheme, dir)))
  }
  if (type === 'sectionGroups') {
    only.push(path.resolve(ThemeEnvy.parentTheme, 'sections'))
  }
  return func(ThemeEnvy.parentTheme, only).filter(file => !childRelative.includes(path.relative(ThemeEnvy.parentTheme, file)))
}
