const path = require('path')
const fs = require('fs-extra')
const chalk = require('chalk')

module.exports = function({ target }) {
  const configSrc = path.resolve(__dirname, '.././configs')
  // copy config files
  fs.copy(configSrc, target, err => {
    if (err) return console.error(err)
    console.log(
      'config files copied to ',
      chalk.green(target)
    )
  })
}
