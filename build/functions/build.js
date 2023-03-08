const fs = require('fs-extra')
const glob = require('glob')
const path = require('path')
const buildLiquid = require('./build-liquid')

module.exports = function({ mode, files = [] }) {
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
