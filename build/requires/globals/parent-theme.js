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
  if (!parentThemePath) return
  const parentThemePkg = fs.existsSync(path.resolve(process.cwd(), 'node_modules', parentThemePath))
    ? path.resolve(process.cwd(), 'node_modules', parentThemePath)
    : false
  // look for parent theme in relative path
  const parentThemeRelative = fs.existsSync(path.resolve(process.cwd(), parentThemePath))
    ? path.resolve(process.cwd(), parentThemePath)
    : false
  // prefer node_modules over relative path
  const parentTheme = parentThemePkg || parentThemeRelative

  ThemeEnvy.parentTheme = parentTheme
})()
