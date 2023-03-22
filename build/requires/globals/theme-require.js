/**
 * @file defines our global ThemeRequire function used for loading schema files
  @param {string} file - the filename to load
  @param {object} options - options to pass to the ThemeRequire function
  @param {array} options.delete - an array of schema keys to delete
  @param {object} options.extend - an object of schema keys to extend
  @param {number} options.loop - a number of times to loop the schema
  @param {object} options.suffix
  @returns {object} - the schema object
*/

const glob = require('glob')
const path = require('path')
const requiredModules = []
const { getAll } = require('#Build/functions')
const chalk = require('chalk')
const logSymbols = require('#LogSymbols')

let allSchema

const setPreGlobs = () => {
  allSchema = getAll('schema')
}

// uncache all required files after a build is complete so changes can be made to partials and schemas in between watch events
ThemeEnvy.events.on('watch:start', () => {
  // clear node cache of ThemeRequired modules
  requiredModules.forEach(module => {
    delete require.cache[require.resolve(module)]
  })
  requiredModules.length = 0
  setPreGlobs()
})

const ThemeRequire = (file, options) => {
  // check for file in our pre-globbed arrays
  const ref = getFile(file)

  if (ref.length === 0) {
    console.error(logSymbols.error, chalk.red('Error:'), `Could not find file ${file}`)
    process.exit()
  }

  const filePath = path.resolve(process.cwd(), ref[0])
  let content
  try {
    content = require(filePath)
    if (requiredModules.indexOf(filePath) === -1) requiredModules.push(filePath)
  } catch (error) {
    console.error('\n', logSymbols.error, chalk.red('Error:'), `Invalid JSON, ${error}\n`, chalk.dim(error.stack.split(error)[0]))
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
    content = parseJson(content)
  }

  if (options?.delete) {
    content = schemaDelete(content, options.delete)
  }
  if (options?.extend) {
    content = schemaExtend(content, options.extend)
  }
  if (options?.loop) {
    content = schemaLoop(file, content, options.loop)
  }
  if (options?.suffix) {
    content = schemaSuffix(file, content, options.suffix)
  }

  if (options?.loader) {
    ThemeEnvy.dependencies[options.loader] = ThemeEnvy.dependencies[options.loader] || []
    ThemeEnvy.dependencies[options.loader].push(filePath)
  }

  return content
}

function schemaDelete(file, src, del) {
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

function schemaLoop(file, src, loop) {
  const replaceWith = []
  for (let i = 1; i < (loop + 1); i++) {
    const srcCopy = parseJson(src)
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

function schemaSuffix(file, src, suffix) {
  const replaceWith = parseJson(src)
  replaceWith.map(entry => {
    if (entry.id) entry.id = `${entry.id}_${suffix}`
    if (entry.label) entry.label = `${entry.label} ${suffix}`
    if (entry.type === 'header') entry.content = `${entry.content} ${suffix}`
    return entry
  })
  return replaceWith
}

function getSchemaFile(file) {
  return allSchema.filter(schema => path.basename(schema) === path.basename(file))
}

function getFile(file) {
  if (file.includes('schema')) {
    return getSchemaFile(file)
  } else {
    const res = glob.sync(path.resolve(ThemeEnvy.themePath, `**/${file}`))
    if (ThemeEnvy.parentTheme && res.length === 0) {
      res.push(...glob.sync(path.resolve(ThemeEnvy.parentTheme, `**/${file}`)))
    }
    return res
  }
}

/* parse JSON for schema extend functions, return error if JSON not readable
  @param src [object] - the file contents to be extended
  @param schemaRef [string] - source schema file name being extended
*/
function parseJson(src, schemaRef) {
  try {
    return JSON.parse(JSON.stringify(src))
  } catch (error) {
    console.error('\n', logSymbols.error, chalk.red('Error:'), `Invalid JSON, ${error}\n`, chalk.dim(error.stack.split(error)[0]))
  }
}

// run setPreGlobs on initial load
setPreGlobs()
// set global access to ThemeRequire
global.ThemeRequire = ThemeRequire
