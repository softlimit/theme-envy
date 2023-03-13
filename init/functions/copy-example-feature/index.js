const path = require('path')
const fs = require('fs-extra')
const chalk = require('chalk')
const logSymbols = require('#LogSymbols')

module.exports = function({ dest }) {
  // define and create the destination example-feature
  const target = path.resolve(dest, './_features/example-feature')
  fs.ensureDirSync(target)

  // define the src example-feature path
  const exampleSrc = path.resolve(__dirname, './example-feature')

  // now copy the files
  fs.copy(exampleSrc, target, err => {
    if (err) return console.error(err)
    console.log(logSymbols.success, chalk.green.bold('Example Feature'), 'copied')
  })
}
