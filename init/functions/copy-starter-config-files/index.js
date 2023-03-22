/**
 * @file Copies starter config files to target directory during init command
 */

const path = require('path')
const fs = require('fs-extra')
const logSymbols = require('#LogSymbols')

module.exports = function({ target }) {
  // copy config files
  const configSrc = path.resolve(__dirname, './configs')
  fs.copy(configSrc, target, err => {
    if (err) return console.error(err)
    console.log(`${logSymbols.success} Config files copied`
    )
  })
  // copy util starter files
  const utilsSrc = path.resolve(__dirname, './utils')
  fs.copy(utilsSrc, path.resolve(target, 'utils'), err => {
    if (err) return console.error(err)
    console.log(`${logSymbols.success} Utils starter files copied`)
  })
}
