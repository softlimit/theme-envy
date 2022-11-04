const fs = require('fs')
const path = require('path')
const replaceReferencedSchema = require('./replace-referenced-schema')
const parseSchema = require('./parse-schema')
const BuildTime = require('./build-time')

const strings = {
  schemaStart: '{% schema %}',
  schemaEnd: '{% endschema %}',
  softlimitStart: '<!-- softlimit',
  softlimitEnd: '-->',
}
const markupFile = fs.readFileSync(path.resolve(__dirname, 'lazy-section-markup.liquid'), 'utf8')

module.exports = function(source) {
  if (source.indexOf(strings.schemaStart) === -1 || source.indexOf('softlimit') === -1) return source
  return ProcessSoftlimitSchema(this, this.resourcePath, source)
}

function ProcessSoftlimitSchema(loader, PARENT, source) {
  const timer = new BuildTime()
  const schemaStart = source.indexOf(strings.schemaStart)
  const schemaEnd = source.indexOf(strings.schemaEnd)
  if (schemaStart === -1 || source.indexOf('softlimit') === -1) return source
  // get schema object from source
  try {
    // <== this is where the magic happens! replaceReferencedSchema finds schema with type softlimit and replaces those references with file contents
    const schema = replaceReferencedSchema(parseSchema(source, PARENT), loader)
    let markup = source.slice(0, schemaStart)
    const schemaString = JSON.stringify(schema, null, 2)
    /* check for lazy schema and automatically wrap section in liquid lazy markup */
    if (schemaString.indexOf('disable_lazy') > -1) {
      markup = markupFile.replace('<!-- SECTION CONTENT -->', markup)
    }
    // excuse this indentation, it gets represented in the final markup file, so it has to be at 0
    timer.report()
    return `
${markup}
${strings.schemaStart}
${schemaString}
${source.slice(schemaEnd)}
`
  } catch (error) {
    throw new Error(error)
  }
}
