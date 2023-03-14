/*
  Attempts to run prettier-plugin-liquid on source string
*/
const liquidPlugin = require('@shopify/prettier-plugin-liquid/standalone')
const prettier = require('prettier/standalone')
const chalk = require('chalk')
const logSymbols = require('#LogSymbols')

module.exports = function(source, pathname) {
  let prettified = false
  try {
    prettified = prettier.format(source, { plugins: [liquidPlugin], parser: 'liquid-html' })
  } catch (error) {
    console.log(logSymbols.warning, chalk.yellow('Warning:'), chalk.dim(`there was an issue prettifying ${pathname}`))
  }
  if (prettified) return prettified
  return source
}
