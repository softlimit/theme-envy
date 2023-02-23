/*
  Copies all locales files from the src folder to the dist folder with no transformations
*/
const fs = require('fs-extra')
const path = require('path')

// if dist/locales does not exist, create it
if (!fs.existsSync(path.resolve(process.cwd(), 'dist/locales'))) {
  fs.mkdirSync(path.resolve(process.cwd(), 'dist/locales'), { recursive: true })
}
try {
  fs.copySync(path.resolve(process.cwd(), 'src/locales'), path.resolve(process.cwd(), 'dist/locales'))
} catch (err) {
  console.error(err)
}
