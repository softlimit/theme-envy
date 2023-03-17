/*
  Copies all locales files from the src folder to the dist folder with no transformations
*/
const fs = require('fs-extra')
const path = require('path')
const glob = require('glob')

const assets = glob.sync(path.resolve(process.build.themeRoot, '**/assets/**/*.*'))

// if dist/assets doesn't exist create it
fs.ensureDirSync(path.resolve(process.build.outputPath, 'assets'))

assets.forEach(asset => {
  try {
    fs.copySync(asset, path.resolve(process.build.outputPath, 'assets', path.basename(asset)))
    // update progress bar
    process.build.progress.bar.increment()
  } catch (err) {
    console.error(err)
  }
})
