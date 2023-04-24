/**
  @file Copies all locales files from the src folder to the dist folder with no transformations
*/
const fs = require('fs-extra')
const path = require('path')
const { getAll } = require('#Build/functions')

const locales = getAll('locales')

// if dist/locales doesn't exist create it
fs.ensureDirSync(path.resolve(ThemeEnvy.outputPath, 'locales'))

locales.forEach(locale => {
  try {
    fs.copySync(locale, path.resolve(ThemeEnvy.outputPath, 'locales', path.basename(locale)))
    // update progress bar
    ThemeEnvy.progress.increment('locales', 1)
  } catch (err) {
    console.error(err)
  }
})
