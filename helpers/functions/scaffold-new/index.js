/**
  * @file Creates a directory in theme-envy/features or theme-envy/elements with starter files to build your feature or element
  * @param {string} type - The type of feature or element to create.
  * @param {string} name - The name of the feature or element to create.
  * @param {string} include - A comma separated list of files/directory to include in a new feature (not applicable to elements).
  * @example
  * npx theme-envy new <feature|element> <feature-name> [all|sections|snippets|schema|install|styles|config]
  */

const chalk = require('chalk')
const logSymbols = require('#LogSymbols')
const { element, feature } = require('./functions')

module.exports = function(type, name, include) {
  console.log(logSymbols.info, chalk.cyan('Creating new'), chalk.green.bold(name), chalk.underline.bold(type), chalk.cyan('...'))

  switch (type) {
    case 'feature':
      feature(name, include)
      break
    case 'element':
      element(name)
      break
    default:
      console.log(logSymbols.error, chalk.red('Error:'), `Invalid type ${type}`)
      process.exit()
  }
}
