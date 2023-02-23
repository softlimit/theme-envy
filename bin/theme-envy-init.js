/*
  npx theme-envy init --target=path/to/dest

  creates skeleton structure for src folder
    - Shopify directories
    - Adds "_features" and "_elements" directories
    - config files
*/
const path = require('path')
const fs = require('fs')
const fse = require('fs-extra')
const chalk = require('chalk')

const dirSrc = path.resolve(__dirname, '.././src-structure')
const configSrc = path.resolve(__dirname, '.././configs')
const exFeatSrc = path.resolve(__dirname, '.././example-feature')

module.exports = function(args, opts = { target: './', feature: false }) {
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

  if (!opts.feature) return
  fs.mkdir(path.join(target, 'example-feature'), err => {
    if (err) return console.error(err)
  })
  const featDest = path.join(target, 'src')
  fse.copy(exFeatSrc, featDest, err => {
    if (err) return console.error(err)
    console.log(
      'example feature copied to src/_features directory in ',
      chalk.green(target)
    )
  })
}
