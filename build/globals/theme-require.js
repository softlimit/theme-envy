/*
  Function: accepts a filename and a glob string and returns the file contents from /src
  Works for .js files
  @param {string} file - the filename to load
  @param {string} globStr - the glob string to search for the file: defaults to ./src/
*/
const glob = require('glob')
const path = require('path')
const caller = require('caller')
const requiredModules = []

let allJsonSchema

const setPreGlobs = () => {
  allJsonSchema = glob.sync('./src/**/{_schema,schema}/**/*.js')
}

// uncache all required files after a build is complete so changes can be made to partials and schemas in between watch events
process.build.events.on('watch:start', () => {
  // clear node cache of ThemeRequired modules
  requiredModules.forEach(module => {
    delete require.cache[require.resolve(module)]
  })
  requiredModules.length = 0
  setPreGlobs()
})

const ThemeRequire = (file, options) => {
  // if file is a relative path... use caller() to determine path of parent file and set relative path to that file
  let globStr
  options?.globStr ? globStr = options.globStr : globStr = './src/'

  if (file.includes('./')) {
    globStr = `./src/${path.dirname(caller()).split('src/')[1]}`
    file = path.basename(file)
  }

  // check for file in our pre-globbed arrays
  const ref = getFile(file, globStr)

  if (ref.length === 0) {
    console.error(`Could not find file ${file}`)
    process.exit()
  }

  const filePath = path.resolve(process.cwd(), ref[0])
  let content
  try {
    content = require(filePath)
    if (requiredModules.indexOf(filePath) === -1) requiredModules.push(filePath)
  } catch (error) {
    console.error(filePath, error)
    process.exit()
  }

  // Add schema extend/delete support
  /*
  * ***********************
  * Example usage:
  * ***********************
    const textLockupBlock = ThemeRequire(
      '_schema/schema-text-lockup-block.json',
      {
        delete: ['Text Background', 'text_bg_opacity'],
        extend: {
          title: {
            default: 'Hello World'
          }
        }
        loop: 3,
        suffix: 2
      })
  */

  // if module.export is a function, call it with options.args
  if (typeof content === 'function') {
    content = content(options?.args)
  }

  if (options?.extend || options?.delete || options?.loop || options?.suffix || options?.args) {
    // make copy of the schema to modify so we don't transform the original
    content = JSON.parse(JSON.stringify(content))
  }

  if (options?.delete) {
    content = schemaDelete(content, options.delete)
  }
  if (options?.extend) {
    content = schemaExtend(content, options.extend)
  }
  if (options?.loop) {
    content = schemaLoop(content, options.loop)
  }
  if (options?.suffix) {
    content = schemaSuffix(content, options.suffix)
  }

  if (options?.loader) {
    process.build.dependencies[options.loader] = process.build.dependencies[options.loader] || []
    process.build.dependencies[options.loader].push(filePath)
  }

  return content
}

function schemaDelete(src, del) {
  const replaceWith = src.filter(entry => {
    if (entry.settings) {
      entry.settings = schemaDelete(entry.settings, del)
      return entry
    }
    return ((entry.id ? !del.includes(entry.id) : false) || (entry.content ? !del.includes(entry.content) : false))
  })
  return replaceWith
}

function schemaExtend(src, exts) {
  let replaceWith
  Object.entries(exts).forEach(ext => {
    // map extension to schema
    replaceWith = src.map(entry => {
      if (entry.settings) {
        schemaExtend(entry.settings, exts)
      }
      if (entry.id !== ext[0] && entry.content !== ext[0]) return entry
      Object.entries(ext[1]).forEach(val => {
        entry[val[0]] = val[1]
      })
      return entry
    })
  })
  return replaceWith
}

function schemaLoop(src, loop) {
  const replaceWith = []
  for (let i = 1; i < (loop + 1); i++) {
    const srcCopy = JSON.parse(JSON.stringify(src))
    srcCopy.map(entry => {
      if (entry.id) entry.id = `${entry.id}_${i}`
      if (entry.label) entry.label = `${entry.label} ${i}`
      if (entry.type === 'header') entry.content = `${entry.content} ${i}`
      return entry
    })
    replaceWith.push(srcCopy)
  }
  return replaceWith
}

function schemaSuffix(src, suffix) {
  const replaceWith = JSON.parse(JSON.stringify(src))
  replaceWith.map(entry => {
    if (entry.id) entry.id = `${entry.id}_${suffix}`
    if (entry.label) entry.label = `${entry.label} ${suffix}`
    if (entry.type === 'header') entry.content = `${entry.content} ${suffix}`
    return entry
  })
  return replaceWith
}

function getSchemaFile(file) {
  // remove leading ./
  if (file.includes('./')) {
    file = file.replace('./', '')
  }
  file = `/${file.replace('.{js,json}', '.js')}`
  return allJsonSchema.filter(schema => schema.includes(file))
}

function getFile(file, globStr) {
  if (globStr.includes('schema') || file.includes('schema')) {
    return getSchemaFile(file)
  } else {
    return glob.sync(`${globStr}${file}`)
  }
}

// run setPreGlobs on initial load
setPreGlobs()
// set global access to ThemeRequire
global.ThemeRequire = ThemeRequire
