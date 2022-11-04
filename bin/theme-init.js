/*
  npx theme init --target=path/to/dest

  creates skeleton structure for src folder
    - Shopify directories
    - Softlimit "_features" and "_elements" directories
    - config files
*/
const path = require('path')
const fs = require('fs')
const fse = require('fs-extra')
const chalk = require('chalk')

const dirSrc = path.resolve(__dirname, '.././src-structure')
const configSrc = path.resolve(__dirname, '.././configs')

module.exports = function (args, opts = { target: './' }) {
  const target = path.resolve(process.cwd(), opts.target)

  fs.mkdir(path.join(target, 'src'), err => {
    if (err) return console.error(err)
  })
  const dest = path.join(target, 'src')

  // copy /src directory
  fse.copy(dirSrc, dest, err => {
    if (err) return console.error(err)
    console.log(
      'src directory copied to ',
      chalk.green(dest)
    )
  })

  // copy config files
  fse.copy(configSrc, target, err => {
    if (err) return console.error(err)
    console.log(
      'config files copied to ',
      chalk.green(target)
    )
  })
}
