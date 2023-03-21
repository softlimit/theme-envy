const path = require('path')
const fs = require('fs-extra')
const emoji = require('node-emoji')

module.exports = function({ quiet } = {}) {
  fs.removeSync(ThemeEnvy.outputPath)
  fs.mkdirSync(ThemeEnvy.outputPath)
  const relativeDistPath = path.relative(process.cwd(), ThemeEnvy.outputPath)
  if (!quiet) console.log(emoji.get('sparkles'), `./${relativeDistPath} directory cleaned`)
}
