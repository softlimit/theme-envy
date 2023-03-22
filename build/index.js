/**
  * @file Processes all liquid files in the themePath directory and output them to the outputPath directory.
  * @param {string} env - The mode to build in, either 'development' or 'production'
  * @param {Object} opts - The options object
  * @param {boolean} opts.verbose - Whether or not to log warnings
  * @param {boolean} opts.watch - Whether or not to watch for changes
  * @example
  * // build in production mode
  * build('production')
  * @example
  * // run from the CLI
  * npx theme-envy build [production|development] [--watch|w] [--verbose|v]
  */

const path = require('path')
const chalk = require('chalk')
const emoji = require('node-emoji')
const { themeEnvy, webpack, tailwind } = require('#Build/functions')
const { distClean } = require('#Helpers')

module.exports = async function(env, opts = {}) {
  const mode = env || 'production'

  // empty dist folder for a clean build, do not log the clean message
  distClean({ quiet: true })

  // our pretty build message
  const relativeDistPath = path.relative(process.cwd(), ThemeEnvy.outputPath)
  console.log(
    emoji.get('hammer'),
    chalk.cyan(`Building ./${relativeDistPath} in`),
    mode === 'development' ? chalk.yellow.bold(mode) : chalk.magenta.bold(mode),
    chalk.cyan('mode')
  )

  require('./requires')

  await themeEnvy({ mode, opts })

  if (ThemeEnvy?.tailwind !== false) await tailwind({ mode, opts })

  await webpack({ mode, opts })

  ThemeEnvy.events.emit('build:complete')
}
