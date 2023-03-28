/**
  @file returns an array of all liquid files that are in the dependency tree of the given file.
  @example npx theme-envy tree filepath1,filepath2,filepath3
  */

const chalk = require('chalk')
const { dependencies } = require('./objects')
const { countResults, getDepth } = require('./functions')

module.exports = function(filepaths, options) {
  const files = filepaths.split(',')
  if (!files) {
    console.error('Provide relative file path(s) to find')
    return
  }
  // create our output and run our functions on each file passed in as a command line argument
  files.forEach((filePath, i) => {
  // add a new line between each file
    if (i > 0) console.log('\n')
    const result = dependencies.check(filePath)
    console.log(chalk.bgWhite.black.bold('------------------------------------------'))
    console.log(chalk.bgWhite.black.bold(` ${countResults(result)} files in liquid dependency tree for: \n ${filePath} `))
    console.log(chalk.bgWhite.black.bold('------------------------------------------'))
    if (options.verbose) {
    // our "verbose" output
      console.dir(result, { depth: null, colors: true })
    } else {
    // our "simple" output
      getDepth(result).forEach(entry => {
        let weight, bg
        if (entry.type === 'section') {
          bg = 'bgGray'
          weight = 'bold'
        } else {
          bg = 'bgBlack'
          weight = entry.depth === 0 ? 'bold' : false
        }
        const color = entry.depth === 0 ? 'green' : entry.depth === 1 ? 'yellow' : entry.depth === 2 ? 'blue' : entry.depth === 3 ? 'red' : 'gray'
        if (weight) {
        // output our bold items
          console.log(chalk[weight][color](`${'  '.repeat(entry.depth)}${chalk[weight][color][bg](`${entry.key} (${entry.type})`)}`))
        } else {
          console.log(chalk[color](`${'  '.repeat(entry.depth)}${entry.key} (${entry.type})`))
        }
      })
    }
  })
}
