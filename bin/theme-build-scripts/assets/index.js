/*
  Copies all locales files from the src folder to the dist folder with no transformations
*/
const fs = require('fs-extra')
const path = require('path')
const glob = require('glob')

const assets = glob.sync(path.resolve(process.cwd(), './src/**/assets/**/*.*'))
// if dist/assets doesn't exist create it
if (!fs.existsSync(path.resolve(process.cwd(), 'dist/assets'))) {
  fs.mkdirSync(path.resolve(process.cwd(), 'dist/assets'), { recursive: true })
}
assets.forEach(asset => {
  try {
    fs.copySync(asset, path.resolve(process.cwd(), 'dist/assets', path.basename(asset)))
  } catch (err) {
    console.error(err)
  }
})
