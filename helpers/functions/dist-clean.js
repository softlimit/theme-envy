const path = require('path')
const fs = require('fs-extra')

module.exports = function() {
  fs.removeSync(path.resolve(process.cwd(), 'dist'))
  fs.mkdirSync(path.resolve(process.cwd(), 'dist'))
  console.log('./dist directory cleaned')
}
