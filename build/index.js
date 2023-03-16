/*
  This script will process all liquid files in the src directory and output them to the dist directory.
  Flags:
    -w, --watch: watch for changes and re-run the script
*/

const { spawn } = require('child_process')
const path = require('path')
const webpack = require('webpack')
const webpackConfig = require('#Build/theme-envy.config.js')
const chalk = require('chalk')
const emoji = require('node-emoji')

module.exports = function(env, opts = {}) {
  const mode = env || 'production'
  const watch = opts.watch || false
  const verbose = opts.verbose || false

  // log message to console about what we're doing
  console.log(
    emoji.get('hammer'),
    chalk.cyan('Building ./dist in'),
    mode === 'development' ? chalk.yellow.bold(mode) : chalk.magenta.bold(mode),
    chalk.cyan('mode')
  )
  require('./requires')
  const { buildWatch, build } = require('#Build/functions')
  const ThemeConfig = require(path.resolve(process.cwd(), 'theme.config.js'))

  build({ mode, verbose })
  if (watch) buildWatch({ build, mode })

  // run tailwind
  const tailwindCss = path.resolve(__dirname, '../build/styles/theme-envy.css')
  const tailwindOpts = ['tailwindcss', 'build', '-i', tailwindCss, '-o', './dist/assets/theme-envy.css']
  if (mode === 'production') tailwindOpts.push('--minify')
  if (watch) tailwindOpts.push('--watch')
  const tailwindOutput = verbose ? { stdio: 'inherit' } : {}
  spawn('npx', tailwindOpts, tailwindOutput)
  process.build.progress.bar.increment()

  // run webpack
  // set our webpack mode
  webpackConfig.mode = mode
  // set our webpack optimization
  webpackConfig.optimization.minimize = mode === 'production'
  // set our webpack watch flag
  webpackConfig.watch = watch
  // merge our theme config named entries into webackConfig.entry
  webpackConfig.entry = { ...webpackConfig.entry, ...ThemeConfig.entry }
  webpack(webpackConfig, (err, stats) => {
    if (err || stats.hasErrors()) {
      console.log(stats, err)
    }
    // Done processing - finish up progress bar and make up for our initial increment
    process.build.progress.bar.increment()
    process.build.progress.bar.stop()
  })
}
