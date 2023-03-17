/*
  * Runs webpack during theme-envy build command
*/
const path = require('path')
const webpack = require('webpack')

module.exports = function({ mode, opts }) {
  const watch = opts.watch || false

  const webpackConfig = require('#Build/theme-envy.config.js')
  const ThemeConfig = require(path.resolve(process.cwd(), 'theme.config.js'))
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
