const path = require('path')
const themeBuild = require(path.resolve(__dirname, '../../../build/index.js'))
const themeClean = require('../dist-clean.js')

module.exports = function(newThemeID) {
  themeClean()
  const promise = new Promise((resolve, reject) => {
    themeBuild()
    ThemeEnvy.events.on('build:complete', () => {
      resolve(newThemeID)
    })
  })
  return promise
}
