// const all helpers and export as an object
const extendLiquid = require('./extend-liquid.js')
const flattenShopifyDirectoryStructure = require('./flatten-shopify-directory-structure.js')
const ensureDirectories = require('./ensure-directories.js')
const sectionSchemaInject = require('./section-schema-inject.js')
const liquidPrettify = require('./liquid-prettify.js')

module.exports = { extendLiquid, flattenShopifyDirectoryStructure, liquidPrettify, sectionSchemaInject, ensureDirectories }
