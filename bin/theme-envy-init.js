/*
  npx theme-envy init --target=path/to/dest

  creates skeleton structure for src folder
    - Shopify directories
    - Adds "_features" and "_elements" directories
    - config files
*/
const path = require('path')
const fs = require('fs-extra')
const chalk = require('chalk')
const { ensureDirectories } = require(path.resolve(__dirname, './build-scripts/directory-structure.js'))
const configSrc = path.resolve(__dirname, '.././configs/*.*')

module.exports = function(args, opts = { target: './', feature: false }) {
  const target = path.resolve(process.cwd(), opts.target)

  fs.ensureDirSync(path.join(target, 'src'))

  const dest = path.join(target, 'src')

  // setup our Theme Envy directories
  ensureDirectories({ root: dest, envy: true })

  // copy config files
  fs.copy(configSrc, target, err => {
    if (err) return console.error(err)
    console.log(
      'config files copied to ',
      chalk.green(target)
    )
  })
}
