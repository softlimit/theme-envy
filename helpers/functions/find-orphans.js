/**
 * @file finds orphaned snippets, partials, and assets that have no references in the theme
 */
const chalk = require('chalk')
const path = require('path')
const { dependencies } = require('./liquid-tree/objects')
const { countResults } = require('./liquid-tree/functions')
const getAll = require('#Build/functions/get-all.js')

module.exports = () => {
  const files = [...getAll('snippets'), ...getAll('partials'), ...getAll('assets')]
  const results = files.filter(file => countResults(dependencies.check(file)) <= 1)
  if (!results.length) {
    console.log('No orphaned snippets, partials, or assets found.')
    return
  }

  console.log(chalk.yellow.bold('Orphaned files found:'))
  results.forEach(file => console.log(`${chalk.red('*')}  ${path.relative(ThemeEnvy.themePath, file)}`))
}
