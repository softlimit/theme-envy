/*
  * Get all files from the parent theme that are not in the child
  * @param {function} func - function to get files with a glob, should return an array of file paths
  * @param {array} childFiles - array of file paths from the child theme that we check against
  * @return {array} - array of file paths from the parent theme that are not in the child
*/
const path = require('path')
const ThemeConfig = require(path.resolve(process.cwd(), 'theme.config.js'))
const { directories } = require('#EnsureDirectories')
module.exports = (func, childFiles, type) => {
  const childRelative = childFiles.map(file => path.relative(process.build.themeRoot, file))
  // get all files from the parent theme, using only directories listed in ThemeConfig
  const only = [...ThemeConfig.parentTheme.elements, ...ThemeConfig.parentTheme.features]
  if (type === 'schema') {
    only.push('_schema')
  }
  if (type === 'liquid') {
    only.push(...directories.map(dir => path.resolve(process.build.parentTheme, dir)))
  }
  if (type === 'sectionGroups') {
    only.push(path.resolve(process.build.parentTheme, 'sections'))
  }
  return func(process.build.parentTheme, only).filter(file => !childRelative.includes(path.relative(process.build.parentTheme, file)))
}
