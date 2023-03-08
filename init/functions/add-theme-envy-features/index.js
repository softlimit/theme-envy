/*
  Copies _features during theme-envy init
*/
const fs = require('fs-extra')
const path = require('path')
const glob = require('glob')
const chalk = require('chalk')

module.exports = function({ dest }) {
  const featuresDir = path.resolve(__dirname, './_features')
  const initFeatures = glob.sync(`${featuresDir}/**`).filter(ref => fs.statSync(ref).isDirectory() && ref !== featuresDir)
  initFeatures.forEach(feature => {
    const target = path.resolve(dest, './_features', path.basename(feature))
    fs.copy(feature, target, err => {
      if (err) return console.error(err)
      console.log(
        chalk.green.bold(path.basename(feature)),
        'feature copied to',
        chalk.green(target),
      )
    })
  })
}
