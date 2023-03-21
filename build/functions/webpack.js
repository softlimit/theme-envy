/*
  * Runs webpack during theme-envy build command
*/
const webpack = require('webpack')

module.exports = function({ mode, opts }) {
  const prom = new Promise((resolve, reject) => {
    const watch = opts.watch || false

    const webpackConfig = require('#Build/theme-envy.config.js')
    // run webpack
    // set our webpack mode
    webpackConfig.mode = mode
    // set our webpack optimization
    webpackConfig.optimization.minimize = mode === 'production'
    // set our webpack watch flag
    webpackConfig.watch = watch
    // merge our theme config named entries into webackConfig.entry
    webpackConfig.entry = { ...webpackConfig.entry, ...ThemeEnvy.entry }
    webpack(webpackConfig, (err, stats) => {
      if (err || stats.hasErrors()) {
        console.log(stats, err)
      }
      // Done processing - finish up progress bar and make up for our initial increment
      ThemeEnvy.progressBar.increment()
      ThemeEnvy.progressBar.stop()
      resolve(stats)
    })
  })
  return prom
}
