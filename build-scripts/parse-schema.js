const BuildTime = require('./build-time')

const strings = {
  schemaStart: '{% schema %}',
  schemaEnd: '{% endschema %}',
}

function parseSchema(source, file) {
  const timer = new BuildTime()
  const schemaStart = source.indexOf(strings.schemaStart)
  const schemaEnd = source.indexOf(strings.schemaEnd)
  if (schemaStart === -1 || schemaEnd === -1) return source
  timer.report()
  try {
    return JSON.parse(source.slice(schemaStart + strings.schemaStart.length, schemaEnd))
  } catch (error) {
    console.error(file, error)
    process.exit()
  }
}

module.exports = parseSchema
