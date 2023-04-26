/**
  * @private
  * @file Helper function that returns a list of files that reference the given liquid file
  * @param {string} filePath - path to file to find dependencies for
  * @param {string} source - source code of file to find dependencies for
  * @returns {array} - list of files that reference the given file
*/
const path = require('path')
const fs = require('fs-extra')
const getAll = require('#Build/functions/get-all.js')
// pre glob all liquid partials
const globbedPartials = getAll('partials')
const chalk = require('chalk')
const logSymbols = require('#LogSymbols')

const listDependencies = ({ filePath, source }) => {
  const dependencies = []
  const tags = /{%[-]?\s*((partial|hook|theme)\s['|"](\S*)['|"])\s*[-]?%}/gm
  const inLiquid = /(?<!{%[-]?\s)((partial|hook)\s['|"](.*)['|"])/gm
  const foundTags = [...source.matchAll(tags), ...source.matchAll(inLiquid)]
  foundTags.forEach(tag => {
    const action = tag[2]
    const name = tag[3]
    if (action === 'partial') {
      const file = globbedPartials.filter(partial => path.basename(partial) === `${name}.liquid`)
      // if partialPath doesn't return anything, exit process and output error
      if (file.length === 0) {
        console.log(`\n${logSymbols.error} ${chalk.red.bold('Error:')}\n\n${chalk.red(`${name}.liquid`)} partial file not found, referenced in:\n${chalk.dim.underline(filePath)}\n\nTo resolve, confirm the partial file exists and that the file\nname reference in the {% partial %} tag matches the partial file.\n`)
        process.exit()
      }
      if (file[0] === filePath) return
      if (dependencies.indexOf(file[0]) === -1) dependencies.push(file[0])
    }
    if (action === 'hook') {
      if (filePath && dependencies.indexOf(filePath) === -1) dependencies.push(filePath)
    }
  })
  dependencies.forEach(file => {
    if (file === filePath) return
    const fileSource = fs.readFileSync(file, 'utf8')
    dependencies.concat(listDependencies({ source: fileSource, filePath: file }))
  })
  const resolvedPaths = dependencies.map(file => path.resolve(file))
  return resolvedPaths
}

module.exports = listDependencies
