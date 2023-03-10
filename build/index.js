/*
  This script will process all liquid files in the src directory and output them to the dist directory.
  Flags:
    -w, --watch: watch for changes and re-run the script
*/

const { spawn } = require('child_process')
const path = require('path')
const webpack = require('webpack')
const webpackConfig = require('#Build/theme-envy.config.js')
const { buildWatch, build } = require('#Build/functions')

module.exports = function(env, opts = {}) {
  require('./requires')
  const ThemeConfig = require(path.resolve(process.cwd(), 'theme.config.js'))
  const mode = env ? 'production' : 'development'
  const watch = opts.watch || false
  const verbose = opts.verbose || false

  build({ mode })
  if (watch) buildWatch({ build })

  // run tailwind
  const tailwindCss = path.resolve(__dirname, '../build/styles/theme-envy.css')
  const tailwindOpts = ['tailwindcss', 'build', '-i', tailwindCss, '-o', './dist/assets/theme-envy.css']
  if (mode === 'production') tailwindOpts.push('--minify')
  if (watch) tailwindOpts.push('--watch')
  const tailwindOutput = verbose ? { stdio: 'inherit' } : {}
  spawn('npx', tailwindOpts, tailwindOutput)

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
    // Done processing
  })
}
