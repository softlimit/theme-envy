const path = require('path')
const fs = require('fs-extra')
const emoji = require('node-emoji')

module.exports = function() {
  fs.removeSync(path.resolve(process.cwd(), 'dist'))
  fs.mkdirSync(path.resolve(process.cwd(), 'dist'))
  console.log(emoji.get('sparkles'), './dist directory cleaned')
}
