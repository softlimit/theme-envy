/**
 * @file Returns starter content by file name, defaults to package file
 * @param {string} fileName - The name of the starter file to return
 * @param {array} args - An array of arguments to pass to the starter file
 * @returns {string} - The starter file content
 */

const path = require('path')
const fs = require('fs-extra')
const logSymbols = require('#LogSymbols')
const chalk = require('chalk')

module.exports = (fileName, args) => {
  const fileExists = fs.existsSync(path.join(process.cwd(), '/utils/', fileName))
  if (!fileExists) {
    console.log(logSymbols.error, chalk.red('Error:'), `Starter file ${fileName} not found`)
    process.exit()
  }
  const content = require(path.join(process.cwd(), '/utils/', fileName))
  return content(...args)
}
