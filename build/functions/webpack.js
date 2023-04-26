/**
  * @private
  * @file Runs webpack during ThemeEnvy build
  * @param {Object} options - options object
  * @param {string} options.mode - webpack mode, either 'development' or 'production'
  * @param {Object} options.opts - options object
  * @param {Boolean} options.opts.watch - whether or not to run webpack in watch mode
  * @returns {Promise}
  */

const path = require('path')
const webpack = require('webpack')
const getAll = require('./get-all')

module.exports = function({ mode, opts }) {
  return new Promise((resolve, reject) => {
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
    // merge our theme config resolve aliases into webpackConfig.resolve.alias
    if (ThemeEnvy.resolve?.alias) webpackConfig.resolve.alias = { ...webpackConfig.resolve.alias, ...ThemeEnvy.resolve.alias }

    if (ThemeEnvy?.tailwind !== false) {
      // if tailwind is enabled, we need to add our critical css to the entry list
      webpackConfig.entry['theme-envy.critical'] = [`${ThemeEnvy.paths.build}/requires/styles/theme-envy.css`]
    }
    if (ThemeEnvy?.tailwind === false && getAll('criticalCSS').length > 0) {
      // if tailwind is disabled, we need to add our critical css to the entry list
      webpackConfig.entry['theme-envy.critical'] = [`${ThemeEnvy.paths.build}/requires/styles/theme-envy.css`]
    }

    // check for Aliases and Entries in parent theme parent.config.js and merge them with our own
    if (ThemeEnvy.parentTheme) {
      const parentThemeConfig = require(path.resolve(ThemeEnvy.parentTheme.path, 'parent.config.js'))
      // merge parent theme aliases into webpackConfig.resolve.alias
      if (parentThemeConfig.resolve?.alias) webpackConfig.resolve.alias = { ...webpackConfig.resolve.alias, ...parentThemeConfig.resolve.alias }
      // iterate over parent theme entries and add them to webpackConfig.entry, merging with our own into an array if necessary
      if (parentThemeConfig.entry) {
        for (const [key, value] of Object.entries(parentThemeConfig.entry)) {
          if (webpackConfig.entry[key]) {
            webpackConfig.entry[key] = [...webpackConfig.entry[key], ...value]
          } else {
            webpackConfig.entry[key] = [...value]
          }
        }
      }
    }
    webpack(webpackConfig, (err, stats) => {
      if (err || stats.hasErrors()) {
        console.log(stats, err)
        reject(err)
      }
      // Done processing - finish up progress bar and make up for our initial increment
      ThemeEnvy.progress.increment('webpack')
      resolve(stats)
    })
  })
}
