/**
  * @file Prebuild helper script that will inject the schema js file into the corresponding sections/*.liquid file
  * also injects installs for blocks/section schema
  * @example
  * // include the schema in the section liquid file
  * {% schema 'schema-file.js' %}
  */
const path = require('path')
const { parseSchema } = require('#Helpers')

module.exports = function({ source, filePath }) {
  if (!filePath.includes('sections')) return source
  // inject installs into inlined schema with {% schema %} {% endschema %} tags
  const hasSchemaTag = source.match(/{% schema %}/g)
  if (hasSchemaTag) return injectInstallsSchema({ source, filePath })
  // inject schema from file into schema with {% schema 'filename.js' %} tags
  const hasJsSchema = source.match(/{% schema '(.*)' %}/g) || source.match(/{% schema "(.*)" %}/g)
  if (hasJsSchema) return injectJsSchema({ source, filePath, schema: hasJsSchema })
  // if neither of the above...
  return source
}

function injectJsSchema({ source, filePath, schema }) {
  // regexp for a quoted string within our schema match
  const schemaFile = schema[0].match(/'(.*)'/)[1] || schema[0].match(/"(.*)"/)[1]
  // load the file export
  const schemaSource = ThemeRequire(schemaFile, { loader: filePath })
  // check for installs
  const schemaWithInjections = checkInstalls({ schema: schemaSource, filePath })
  // replace the {% schema %} tag with the schema string and update asset
  // if (filePath.includes('media-with-text-overlay.liquid')) {
  //   console.dir(schemaWithInjections.blocks, { depth: null })
  // }
  return source.replace(schema[0], formatSchema(schemaWithInjections))
}

function injectInstallsSchema({ source, filePath }) {
  // split our schema tag from the rest of the file
  const { schema, schemaStart, schemaEnd } = parseSchema(source)
  const schemaWithInjections = checkInstalls({ schema, filePath })
  // replace everything between schemaStart and schemaEnd with the new schema
  source = source.replace(source.substring(schemaStart, schemaEnd + String('{% endschema %}').length), formatSchema(schemaWithInjections))
  return source
}

function checkInstalls({ schema, filePath }) {
  // check our schema from install.js files and inject into schema
  const sectionName = `${path.basename(path.dirname(filePath))}/${path.basename(filePath)}`
  if (!ThemeEnvy.schema || !ThemeEnvy.schema[sectionName]) return schema

  if (ThemeEnvy.schema[sectionName].settings) {
    schema.settings = schema.settings || []
    schema.settings = [...schema.settings, ...ThemeEnvy.schema[sectionName].settings]
  }

  if (ThemeEnvy.schema[sectionName].blocks) {
    schema.blocks = schema.blocks || []
    schema.blocks = [...schema.blocks, ...ThemeEnvy.schema[sectionName].blocks]
  }

  return schema
}

function formatSchema(schema) {
  return `{% schema %}
${JSON.stringify(schema, null, 2)}
{% endschema %}
`
}
