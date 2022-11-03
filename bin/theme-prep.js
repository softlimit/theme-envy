/*
While starting a development session, we want to see if there is an existing build present in the dist directory
If there is, then we don't need to rebuild before running `shopify theme serve` because the files in the directory will be similar to the build that is running during a theme watch build
We are making a reasonable guess that if the required directories are all present then we have a build
*/
// requiring path and fs modules
const path = require('path')
const fs = require('fs')

const themeClean = require(path.resolve(__dirname, './theme-clean'))
const themeIgnore = require(path.resolve(__dirname, './theme-ignore'))
const themeBuild = require(path.resolve(__dirname, './theme-build'))

module.exports = function() {
  // joining path of directory
  const dist = path.join(process.cwd(), 'dist')
  // passsing directoryPath and callback function
  const dirs = fs.readdirSync(dist).filter(function(file) {
    return fs.statSync(dist + '/' + file).isDirectory()
  })
  // checking for directory structure in dist folder if it exists, we don't rebuild
  if (JSON.stringify(dirs) === '["assets","config","layout","locales","sections","snippets","templates"]') {
    console.log('FULL THEME BUILD ALREADY EXISTS... continue with existing build')
  } else {
    themeClean()
      .then(() => {
        themeIgnore('none')
        themeBuild(['development'])
      })
  }
}
