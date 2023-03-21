/*
  Copies all locales files from the src folder to the dist folder with no transformations
*/
const fs = require('fs-extra')
const path = require('path')
const glob = require('glob')

const assets = glob.sync(path.resolve(ThemeEnvy.themePath, '**/assets/**/*.*'))

// if dist/assets doesn't exist create it
fs.ensureDirSync(path.resolve(ThemeEnvy.outputPath, 'assets'))

assets.forEach(asset => {
  try {
    fs.copySync(asset, path.resolve(ThemeEnvy.outputPath, 'assets', path.basename(asset)))
    // update progress bar
    ThemeEnvy.progress.increment('assets', 1)
  } catch (err) {
    console.error(err)
  }
})
