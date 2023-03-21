const path = require('path')
const fs = require('fs-extra')
const emoji = require('node-emoji')

module.exports = function({ quiet } = {}) {
  fs.removeSync(path.resolve(process.cwd(), 'dist'))
  fs.mkdirSync(path.resolve(process.cwd(), 'dist'))
  if (!quiet) console.log(emoji.get('sparkles'), './dist directory cleaned')
}
