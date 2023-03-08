/*
  This script will process all liquid files in the src directory and output them to the dist directory.
  Flags:
    -w, --watch: watch for changes and re-run the script
*/
const path = require('path')
const glob = require('glob')
const fs = require('fs')
const chokidar = require('chokidar')

const buildLiquid = require('./liquid')

require('./globals')
require('./assets')
require('./config')
require('./locales')
require('./scripts')
require('./snippets')
require('./templates')

module.exports = function({ watch, mode }) {
  function build(files = []) {
    if (files.length > 0) {
      // remove partials and schema = require(files list)
      files = files.filter((file) => !file.includes('partials/') && !file.includes('schema/'))
    }
    /*
     if we have files passed in (during watch process), use those
     otherwise glob for all liquid files
    */
    const liquid = files.length > 0 ? files.filter(file => file.includes('.liquid')) : glob.sync(path.resolve('src/**/*.liquid')).filter((file) => !file.includes('partials'))
    const sectionGroups = files.length > 0 ? files.filter(file => file.includes('.json')) : glob.sync(path.resolve('src/**/sections/*.json'))

    // process all liquid files and output to dist directory
    liquid.forEach((file) => buildLiquid(file, mode))

    // copy sectionGroup files to dist
    if (sectionGroups.length > 0) {
      sectionGroups.forEach((file) => {
        fs.copyFileSync(file, path.resolve(process.cwd(), 'dist', 'sections', path.basename(file)))
      })
    }
  }
  build()

  if (watch) {
    chokidar.watch(path.resolve(process.cwd(), 'src')).on('change', (path) => {
      process.build.events.emit('watch:start')
      const isJSONTemplate = path.includes('templates/') && path.extname(path) === '.json'
      if (!isJSONTemplate) {
        build([path])
        console.log(`updated: ${path.split('/src/')[1]}`)
      }
    })
  }
}
