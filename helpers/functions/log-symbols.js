/**
  * @file Returns the appropriate log symbols based on unicode support
  * @example
  * console.log(logSymbols.info, 'Info message')
  * @returns {Object} - An object containing the appropriate log symbols
*/
// based on https://github.com/sindresorhus/log-symbols

const chalk = require('chalk')
const isUnicodeSupported = require('./unicode-supported')

const main = {
  info: chalk.cyan('ℹ'),
  success: chalk.green('✔'),
  warning: chalk.yellow('⚠'),
  error: chalk.red('✖'),
}

const fallback = {
  info: chalk.cyan('i'),
  success: chalk.green('√'),
  warning: chalk.yellow('‼'),
  error: chalk.red('×'),
}

const logSymbols = isUnicodeSupported() ? main : fallback

module.exports = logSymbols
