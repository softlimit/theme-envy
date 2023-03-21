/*
  Copies all locales files from the src folder to the dist folder with no transformations
*/
const fs = require('fs-extra')
const path = require('path')

// if dist/locales does not exist, create it
fs.ensureDirSync(path.resolve(ThemeEnvy.outputPath, 'locales'))

try {
  fs.copySync(path.resolve(process.cwd(), 'src/locales'), path.resolve(process.cwd(), 'dist/locales'))
  // update progress bar
  ThemeEnvy.progressBar.increment()
} catch (err) {
  console.error(err)
}
