/*
  This script will process all liquid files in the src directory and output them to the dist directory.
  Flags:
    -w, --watch: watch for changes and re-run the script
*/
const path = require('path')
const glob = require('glob')
const fs = require('fs')

const chokidar = require('chokidar')

require('./globals/index.js')
require('./scripts/index.js')
require('./config/index.js')
require('./templates/index.js')

const helpers = require('./helpers/index.js')

const webpackConfig = require('#Root/bin/theme-build-scripts/envy.config.js')

const { extendLiquid, flattenShopifyDirectoryStructure, liquidPrettify, sectionSchemaInject } = helpers

module.exports = function({ watch }) {
  function build(files = []) {
    if (files.length > 0) {
      // remove partials and schema = require(files list)
      files = files.filter((file) => !file.includes('partials/') && !file.includes('schema/'))
    }
    /*
     if we have files passed in (during watch process), use those
     otherwise glob for all liquid files
    */
    const liquid = files.length > 0 ? files : glob.sync(path.resolve('src/**/*.liquid')).filter((file) => !file.includes('partials'))
    // process all liquid files and output to correct directory
    liquid.forEach((file) => {
      const shopifyPath = flattenShopifyDirectoryStructure(file)
      // skip files that don't need to be processed because they don't have an output path
      if (!shopifyPath) return

      const outputPath = `${webpackConfig.output.path.replace('/assets', '')}/${shopifyPath}`
      let source = fs.readFileSync(file, 'utf8')

      // inject schema .js into liquid section files
      if (file.includes('sections/')) source = sectionSchemaInject({ source, filePath: file })

      // apply our custom liquid tags: partial, hook, theme
      source = extendLiquid({ source, filePath: file })

      // prettify our liquid if possible
      source = liquidPrettify(source, outputPath)

      // create output directory if it doesn't exist
      if (!fs.existsSync(path.dirname(outputPath))) {
        fs.mkdirSync(path.dirname(outputPath), { recursive: true })
      }
      // save our file
      fs.writeFileSync(outputPath, source)
    })
  }
  build()

  if (watch) {
    chokidar.watch(path.resolve(process.cwd(), 'src')).on('change', (path) => {
      process.build.events.emit('watch:start')
      if (!path.includes('.json')) {
        build([path])
        console.log(`updated: ${path.split('/src/')[1]}`)
      }
    })
  }
}
