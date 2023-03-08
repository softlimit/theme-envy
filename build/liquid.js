/*
  * Processes our liquid files during build/watch to the dist folder
  * @param {string} file - path to file
  * @param {string} mode - 'development' or 'production'
  * @returns {void}
*/
const path = require('path')
const fs = require('fs-extra')
const helpers = require('#Helpers')
const { extendLiquid, flattenShopifyDirectoryStructure, liquidPrettify, sectionSchemaInject } = helpers
const webpackConfig = require('#Build/theme-envy.config.js')

module.exports = function(file, mode) {
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
  if (mode === 'production') source = liquidPrettify(source, outputPath)

  // create output directory if it doesn't exist
  fs.ensureDirSync(path.dirname(outputPath))
  // save our file
  fs.writeFileSync(outputPath, source)
}
