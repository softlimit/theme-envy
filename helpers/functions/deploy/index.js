/**
  * @description theme-envy deploy duplicates the live theme, then pushes a build of the current theme to that new theme
  * @example npx theme-envy deploy
  * @returns {Void}
  */

const path = require('path')
const fs = require('fs')
const packageSettings = require(path.resolve(process.cwd(), 'package.json'))
const duplicateLiveTheme = require('./duplicate-live-theme')
const buildPromise = require('./build-promise')
const pushTheme = require('./push-theme')
const themeClean = require('../dist-clean')
const themeName = `${packageSettings.version} ${packageSettings.description}`

module.exports = function() {
  // clean the dist directory
  themeClean()

  // duplicate live theme into output path
  duplicateLiveTheme({ themeName })

    // build theme from src
    .then(buildPromise)

    // push theme to new theme id
    .then(pushTheme)

    // get the theme id from the pushed theme and run post deploy scripts
    .then(themeID => {
      const postDeployPath = path.resolve(process.cwd(), 'utils/post-deploy.js')
      if (fs.existsSync(postDeployPath)) {
        const postDeploy = require(postDeployPath)
        postDeploy({ themeName, themeID })
      }

      // all done, log that the deploy is complete
      console.log('DEPLOY COMPLETE')
    })
  // catch any errors and log them
    .catch(error => {
      console.log('Could not deploy theme')
      console.log(error)
      process.exit()
    })
}
