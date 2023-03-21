const fs = require('fs-extra')
const emoji = require('node-emoji')

module.exports = function({ quiet } = {}) {
  fs.removeSync(ThemeEnvy.outputPath)
  fs.mkdirSync(ThemeEnvy.outputPath)
  if (!quiet) console.log(emoji.get('sparkles'), './dist directory cleaned')
}
