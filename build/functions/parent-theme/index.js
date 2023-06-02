/**
 * @private
 * @file Checks for a parent theme in node_modules or relative path and sets ThemeEnvy.parentTheme to the path
 */

const fs = require('fs-extra')
const path = require('path');

(() => {
  const ThemeConfigPath = path.resolve(process.cwd(), 'theme.config.js')
  if (!fs.existsSync(ThemeConfigPath)) return
  ThemeEnvy.childPreferred = ThemeEnvy.childPreferred || []

  // look for parent theme in node_modules
  const parentThemePath = ThemeEnvy.parentTheme?.path
  if (!parentThemePath) {
    removeParentThemeReference()
    return
  }
  const parentThemePkg = fs.existsSync(path.resolve(process.cwd(), 'node_modules', parentThemePath))
    ? path.resolve(process.cwd(), 'node_modules', parentThemePath)
    : false
  // look for parent theme in relative path
  const parentThemeRelative = fs.existsSync(path.resolve(process.cwd(), parentThemePath))
    ? path.resolve(process.cwd(), parentThemePath)
    : false
  // prefer node_modules over relative path
  const parentTheme = parentThemePkg || parentThemeRelative

  if (!parentTheme) {
    removeParentThemeReference()
    return
  }
  ThemeEnvy.parentTheme.path = parentTheme
  // define elements and features arrays
  ThemeEnvy.parentTheme.elements = listFeaturesOrElements({ type: 'elements' })
  ThemeEnvy.parentTheme.features = listFeaturesOrElements({ type: 'features' })
})()

function removeParentThemeReference() {
  delete ThemeEnvy.parentTheme
}

function listFeaturesOrElements({ type }) {
  // get parentTheme config
  const parentConfig = require(path.resolve(ThemeEnvy.parentTheme.path, 'parent.config.js'))
  // get parentTheme theme-envy directory path
  const parentThemeEnvyDir = path.resolve(ThemeEnvy.parentTheme.path, 'src/theme-envy')

  const elementsOrFeatures = fs.readdirSync(path.resolve(parentThemeEnvyDir, type))
    .filter(file => {
      // remove items that are in the parent.config.js exclude array
      if (!parentConfig[type]?.exclude) return true
      return parentConfig[type].exclude.includes(path.parse(file).name) === false
    })
    .filter(file => {
      // remove items that are in theme.config.js exclude array
      if (!ThemeEnvy.parentTheme[type]?.exclude) return true
      return ThemeEnvy.parentTheme[type]?.exclude.includes(path.parse(file).name) === false
    })
    .map(file => path.resolve(parentThemeEnvyDir, type, file).replace('.js', ''))

  // add items that are in the include array of the child theme
  if (ThemeEnvy.parentTheme[type]?.include) {
    ThemeEnvy.parentTheme[type].include.forEach(item => {
      if (!elementsOrFeatures.includes(item)) {
        // check if the item exists in the parent theme
        if (!fs.existsSync(path.resolve(parentThemeEnvyDir, type, item))) {
          console.error(`The ${item} ${type} does not exist in the parent theme`)
          return
        }
        elementsOrFeatures.push(path.resolve(ThemeEnvy.parentTheme.path, 'src/theme-envy', type, item))
      }
    })
  }
  return elementsOrFeatures
}
