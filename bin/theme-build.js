#!/usr/bin/env node
const { spawn } = require('child_process')
const buildTheme = require('./theme-build-scripts/index.js')
const webpack = require('webpack')
const webpackConfig = require('./theme-build-scripts/envy.config.js')
// parse command line arguments
const args = process.argv.slice(2)
// filter out flags
const flags = args.filter((arg) => arg.startsWith('-'))
// define our watch flag
const watch = flags.includes('-w') || flags.includes('--watch')
const mode = flags.includes('-p') || flags.includes('--production') ? 'production' : 'development'
// set our webpack mode
webpackConfig.mode = mode
// set our webpack optimization
webpackConfig.optimization.minimize = mode === 'production'
// set our webpack watch flag
webpackConfig.watch = watch

module.exports = (args, { direct, watch, verbose, argv }) => {
  buildTheme({ watch, mode })
  // run tailwind
  const tailwindOpts = ['tailwindcss', 'build', '-i', './src/styles/critical.css', '-o', './dist/assets/critical.css']
  if (mode === 'production') tailwindOpts.push('--minify')
  spawn('npx', tailwindOpts, { stdio: 'inherit' })

  // run webpack
  webpack(webpackConfig, (err, stats) => {
    if (err || stats.hasErrors()) {
      console.log(stats, err)
    }
    // Done processing
  })
}
