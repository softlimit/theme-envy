/**
  * @file Deletes and rebuilds the output directory before a build
  * @param {Object} options
  * @param {boolean} options.quiet - Do not log the clean message
  * @returns {Void}
  * @example distClean()
  * @example distClean({ quiet: true })
  */

const path = require('path')
const fs = require('fs-extra')
const emoji = require('node-emoji')

module.exports = function({ quiet } = {}) {
  fs.removeSync(ThemeEnvy.outputPath)
  fs.mkdirSync(ThemeEnvy.outputPath)
  const relativeDistPath = path.relative(process.cwd(), ThemeEnvy.outputPath)
  if (!quiet) console.log(emoji.get('sparkles'), `./${relativeDistPath} directory cleaned`)
}
