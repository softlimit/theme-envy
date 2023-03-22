/**
 * @file check if a Shopify theme exists in the target directory and move it to the destination
 * @description Used during the init process to move an existing Shopify theme to the new source folder
 * @param {object} options - options object
 * @param {string} options.target - target directory
 * @param {string} options.dest - destination directory
 */

const path = require('path')
const fs = require('fs-extra')
const { directories } = require('#EnsureDirectories')
const chalk = require('chalk')
const logSymbols = require('#LogSymbols')

module.exports = function({ target, dest }) {
  // if we have a valid Shopify theme structure in the target directory move those files to the dest
  const rootDirs = fs.readdirSync(target).filter(res => !res.includes('.'))
  const shopifyThemeExistsInRoot = directories.every(dir => rootDirs.includes(dir))
  if (shopifyThemeExistsInRoot) {
    console.log(logSymbols.info, chalk.cyan('Existing theme present, moving to new source folder'))
    directories.forEach(dir => {
      fs.moveSync(path.join(target, dir), path.join(dest, dir))
    })
    console.log(logSymbols.success, 'Existing theme moved')
  }
}
