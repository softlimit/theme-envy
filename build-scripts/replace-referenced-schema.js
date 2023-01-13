/*
 replaces JSON objects with "type": "softlimit" with their referenced content from the relevant file
*/
const BuildTime = require('./build-time')

function replaceReferencedSchema(schema, loader, file) {
  try {
    // in 'extension-installer.js' we pass the individual arrays directly instead of processing the whole schema
    if (Array.isArray(schema)) return findInArray(schema, file)
    // process the entire schema object
    return findObjectByType(schema, file)
  } catch (error) {
    throw new Error(error, schema, file)
  }

  function replaceEntry(obj) {
    const timer = new BuildTime()

    const content = ThemeRequire(`${obj.file}.{js,json}`, {
      globStr: './src/**/{schema,_schema}/',
      extend: obj.extend,
      delete: obj.delete,
      args: obj.args,
      loader
    })

    const replaceWith = findInArray(JSON.parse(JSON.stringify(findInArray(content))), obj.file)

    timer.report()
    return replaceWith
  }

  function findInArray(arr, file) {
    const timer = new BuildTime()
    // loop through array backwards so we don't mess with the index as we insert items
    if (!Array.isArray(arr)) {
      console.error(file || arr, 'Expected array, got ' + typeof arr)
    }
    for (let i = arr.length - 1; i >= 0; i--) {
      if (arr[i].type === 'softlimit') {
        arr.splice(i, 1, ...replaceEntry(arr[i]))
      }
      arr[i] = findObjectByType(arr[i], file)
    }
    timer.report()
    return arr
  }

  function findObjectByType(schema, file) {
    const timer = new BuildTime()
    for (const key in schema) {
      if (Array.isArray(schema[key])) {
        schema[key] = findInArray(schema[key], file)
      }
    }
    timer.report()
    return schema
  }
}

module.exports = replaceReferencedSchema
