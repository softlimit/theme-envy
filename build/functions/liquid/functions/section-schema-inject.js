/**
  * @file Prebuild helper script that will inject the schema js file into the corresponding sections/*.liquid file
  * @example
  * // include the schema in the section liquid file
  * {% schema 'schema-file.js' %}
  */

module.exports = function({ source, filePath }) {
  if (!filePath.includes('sections')) return source
  const schema = source.match(/{% schema '(.*)' %}/g) || source.match(/{% schema "(.*)" %}/g)
  // if there are no schema tags with a filename string, return
  if (!schema) return source
  // regexp for a quoted string within our schema match
  const schemaFile = schema[0].match(/'(.*)'/)[1] || schema[0].match(/"(.*)"/)[1]
  // load the file export
  const schemaSource = ThemeRequire(schemaFile, { loader: filePath })
  // replace the {% schema %} tag with the schema string and update asset
  return source.replace(schema[0], formatSchema(schemaSource))
}

function formatSchema(schema) {
  return `{% schema %}
${JSON.stringify(schema, null, 2)}
{% endschema %}
`
}
