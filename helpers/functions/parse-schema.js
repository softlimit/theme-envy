const strings = {
  schemaStart: '{% schema %}',
  schemaEnd: '{% endschema %}',
}

module.exports = function(source, file) {
  const schemaStart = source.indexOf(strings.schemaStart)
  const schemaEnd = source.indexOf(strings.schemaEnd)
  if (schemaStart === -1 || schemaEnd === -1) return source
  try {
    return {
      schema: JSON.parse(source.slice(schemaStart + strings.schemaStart.length, schemaEnd)),
      schemaStart,
      schemaEnd
    }
  } catch (error) {
    console.error(file, error)
    process.exit()
  }
}
