/*
  This script will process all liquid files in the src directory and output them to the dist directory.
  Flags:
    -w, --watch: watch for changes and re-run the script
*/

const chalk = require('chalk')
const emoji = require('node-emoji')

module.exports = async function(env, opts = {}) {
  const mode = env || 'production'

  // log message to console about what we're doing
  console.log(
    emoji.get('hammer'),
    chalk.cyan('Building ./dist in'),
    mode === 'development' ? chalk.yellow.bold(mode) : chalk.magenta.bold(mode),
    chalk.cyan('mode')
  )
  require('./requires')

  const { themeEnvy, webpack, tailwind } = require('#Build/functions')

  themeEnvy({ mode, opts })

  tailwind({ mode, opts })

  await webpack({ mode, opts })

  ThemeEnvy.events.emit('build:complete')
}
