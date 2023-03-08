const path = require('path')
const fs = require('fs-extra')
const chalk = require('chalk')

module.exports = function({ target }) {
  // copy config files
  const configSrc = path.resolve(__dirname, './configs')
  fs.copy(configSrc, target, err => {
    if (err) return console.error(err)
    console.log(
      chalk.green.bold('Config files'),
      'copied to',
      chalk.green(target)
    )
  })
  // copy util starter files
  const utilsSrc = path.resolve(__dirname, './utils')
  fs.copy(utilsSrc, path.resolve(target, 'utils'), err => {
    if (err) return console.error(err)
    console.log(
      chalk.green.bold('Util starter files'),
      'copied to',
      chalk.green(target)
    )
  })
}
