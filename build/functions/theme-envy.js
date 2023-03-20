const fs = require('fs-extra')
const path = require('path')
const liquid = require('./liquid')
const getAll = require('./get-all')
const failedHookInstalls = require('./failed-hook-installs')

module.exports = function({ mode, opts }) {
  const verbose = opts.verbose || false

  // clear dist directory
  fs.emptyDirSync(path.resolve(process.cwd(), 'dist'))
  // build files
  build({ mode, verbose })
  // watch for changes
  if (opts.watch) {
    ThemeEnvy.events.on('build:complete', () => {
      watch({ mode, verbose })
    })
  }
}

function build({ mode, files = [], verbose }) {
  if (files.length > 0) {
    // remove partials and schema = require(files list)
    files = files.filter((file) => !file.includes('partials/') && !file.includes('schema/'))
  }
  /*
   if we have files passed in (during watch process), use those
   otherwise glob for all liquid files
  */
  const liquidFiles = files.length > 0
    ? files.filter(file => file.includes('.liquid'))
    : getAll('liquid')

  const sectionGroups = files.length > 0
    ? files.filter(file => file.includes('.json'))
    : getAll('sectionGroups')

  // process all liquid files and output to dist directory
  if (liquidFiles.length > 0) {
    liquidFiles.forEach((file) => {
      liquid({ file, mode, verbose })
    })
  }
  ThemeEnvy.progressBar.increment()

  // check for install hooks that reference non-existent hooks
  failedHookInstalls()
  ThemeEnvy.progressBar.increment()

  // copy sectionGroup files to dist
  if (sectionGroups.length > 0) {
    sectionGroups.forEach((file) => {
      fs.copyFileSync(file, path.resolve(process.cwd(), 'dist', 'sections', path.basename(file)))
    })
  }
  ThemeEnvy.progressBar.increment()
}

function watch({ mode, verbose }) {
  const chokidar = require('chokidar')
  console.log('watching for changes...')
  chokidar.watch(ThemeEnvy.themePath).on('change', (path) => {
    ThemeEnvy.events.emit('watch:start')
    const isJSONTemplate = path.includes('templates/') && path.extname(path) === '.json'
    if (!isJSONTemplate) {
      build({ files: [path], mode })
      console.log(`updated: ${path.split('/src/')[1]}`)
    }
  })
}
