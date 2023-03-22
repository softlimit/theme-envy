/**
  @file Copies all locales files from the src folder to the dist folder with no transformations
*/
const fs = require('fs-extra')
const path = require('path')

// if dist/locales does not exist, create it
fs.ensureDirSync(path.resolve(ThemeEnvy.outputPath, 'locales'))

try {
  fs.copySync(path.resolve(ThemeEnvy.themePath, 'locales'), path.resolve(ThemeEnvy.outputPath, 'locales'))
  // update progress bar
  ThemeEnvy.progress.increment('locales')
} catch (err) {
  console.error(err)
}
