/*
  Copies theme-envy features during theme-envy init
*/
const fs = require('fs-extra')
const path = require('path')
const glob = require('glob')
const chalk = require('chalk')
const logSymbols = require('#LogSymbols')

module.exports = function({ dest }) {
  const featuresDir = path.resolve(__dirname, './features')
  const initFeatures = glob.sync(`${featuresDir}/**`).filter(ref => fs.statSync(ref).isDirectory() && ref !== featuresDir)
  initFeatures.forEach(feature => {
    const target = path.resolve(dest, './theme-envy/features', path.basename(feature))
    if (fs.existsSync(target)) return
    fs.copy(feature, target, err => {
      if (err) return console.error(err)
      console.log(`${logSymbols.success} ${chalk.green.bold(path.basename(feature))} feature copied and connected`)
    })
  })
}
