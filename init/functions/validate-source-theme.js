const fs = require('fs-extra')
const path = require('path')
const { directories } = require('#EnsureDirectories')
const chalk = require('chalk')
const logSymbols = require('#LogSymbols')

module.exports = function({ sourceTheme }) {
// verify source theme exists
  if (!fs.existsSync(sourceTheme)) {
    console.error(`${logSymbols.error} ${chalk.red.bold('Error:')} Source theme directory not found: ${sourceTheme}`)
    process.exit(1)
  }

  // validate directory structure of source theme
  directories.forEach(dir => {
    if (!fs.existsSync(path.resolve(sourceTheme, dir))) {
      console.error(`${logSymbols.error} ${chalk.red.bold('Error:')} Source theme required directory not found: ${path.resolve(sourceTheme, dir)}`)
      process.exit(1)
    }
  })
}
