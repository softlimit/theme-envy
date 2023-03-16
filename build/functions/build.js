const fs = require('fs-extra')
const path = require('path')
const buildLiquid = require('./build-liquid')
const getAll = require('./get-all')
const failedHookInstalls = require('./failed-hook-installs')

module.exports = function({ mode, files = [], verbose }) {
  if (files.length > 0) {
    // remove partials and schema = require(files list)
    files = files.filter((file) => !file.includes('partials/') && !file.includes('schema/'))
  }
  /*
   if we have files passed in (during watch process), use those
   otherwise glob for all liquid files
  */
  const liquid = files.length > 0
    ? files.filter(file => file.includes('.liquid'))
    : getAll('liquid')

  const sectionGroups = files.length > 0
    ? files.filter(file => file.includes('.json'))
    : getAll('sectionGroups')

  // process all liquid files and output to dist directory
  if (liquid.length > 0) {
    liquid.forEach((file) => {
      buildLiquid({ file, mode, verbose })
    })
    process.build.progress.bar.increment()
  }

  // check for install hooks that reference non-existent hooks
  failedHookInstalls()
  process.build.progress.bar.increment()

  // copy sectionGroup files to dist
  if (sectionGroups.length > 0) {
    sectionGroups.forEach((file) => {
      fs.copyFileSync(file, path.resolve(process.cwd(), 'dist', 'sections', path.basename(file)))
      process.build.progress.bar.increment()
    })
  }
}
