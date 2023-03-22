/**
  * @file Attempts to run prettier-plugin-liquid on source string
  * @param {Object} options
  * @param {string} options.source - The source string to prettify
  * @param {string} options.pathname - The pathname of the file being prettified
  * @param {boolean} options.verbose - Whether or not to log warnings
  * @returns {string} - The prettified source string or the original source string if prettier fails
*/

const liquidPlugin = require('@shopify/prettier-plugin-liquid/standalone')
const prettier = require('prettier/standalone')
const chalk = require('chalk')
const logSymbols = require('#LogSymbols')

module.exports = function({ source, pathname, verbose }) {
  let prettified = false
  try {
    prettified = prettier.format(source, { plugins: [liquidPlugin], parser: 'liquid-html' })
  } catch (error) {
    if (verbose) console.log(logSymbols.warning, chalk.yellow('Warning:'), chalk.dim(`there was an issue prettifying ${pathname}`))
  }
  if (prettified) return prettified
  return source
}
