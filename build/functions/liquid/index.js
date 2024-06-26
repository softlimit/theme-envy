/**
  * @file Processes our liquid files during build
  * @description replaces our custom hooks, partials, and theme tags, and injects section schema into section files
  * @param {string} file - path to file
  * @param {string} mode - 'development' or 'production'
  * @returns {Void}
*/
const path = require('path')
const fs = require('fs-extra')
const { extendLiquid, flattenShopifyDirectoryStructure, sectionSchemaInject } = require('./functions')
const { liquidPrettify } = require('#Helpers')

module.exports = function({ file, mode, verbose }) {
  const shopifyPath = flattenShopifyDirectoryStructure(file)
  // skip files that don't need to be processed because they don't have an output path
  if (!shopifyPath) return

  const outputPath = `${ThemeEnvy.outputPath}/${shopifyPath}`
  let source = fs.readFileSync(file, 'utf8')

  // inject schema .js into liquid section or block files
  if (file.includes('sections/') || file.includes('blocks/')) source = sectionSchemaInject({ source, filePath: file })

  // apply our custom liquid tags: partial, hook, theme
  source = extendLiquid({ source, filePath: file })

  // prettify our liquid if possible
  if (mode === 'production') source = liquidPrettify({ source, pathname: outputPath, verbose })

  // create output directory if it doesn't exist
  fs.ensureDirSync(path.dirname(outputPath))
  // save our file
  fs.writeFileSync(outputPath, source)
  // update progress bar
  ThemeEnvy.progress.increment('liquid', 1)
}
