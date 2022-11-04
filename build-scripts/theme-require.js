/*
  Function: accepts a filename and a glob string and returns the file contents from either the @softlimit/framework package or /src
  @param {string} file - the filename to load
  @param {string} globStr - the glob string to search for the file: defaults to ./{src,node_modules/@softlimit/framework/src}/ ie. src dir
*/
const glob = require('glob')
const path = require('path')
const fs = require('fs')
const caller = require('caller')
const BuildTime = require('./build-time')
const replaceReferencedSchema = require('./replace-referenced-schema')
const BuildConfig = require(path.resolve(process.cwd(), './build.config.js'))
const crypto = require('crypto')

// flatten BuildConfig so it's a single array to check against globs against
let FlatConfig = []
Object.entries(BuildConfig).forEach(([key, value]) => {
  FlatConfig = FlatConfig.concat(value)
})

// our standard reference for files in the client or framework

const twoLocations = './{src,node_modules/@softlimit/framework/src}'

let fileCache = {}

// get all liquid partials and filter to partials that exist in build config elements
let allLiquidPartials = glob.sync(`${twoLocations}/**/partials/**/*.liquid`).filter(file => FlatConfig.some(element => file.includes(`/${element}/`)))
let allJsonSchema = glob.sync(`${twoLocations}/**/{schema,_schema}/**/*.{js,json}`)

// uncache stuff after a build is complete so changes can be made to partials and schemas in between watch events
process.BUILD.events.on('build:complete', () => {
  fileCache = {}
  allLiquidPartials = glob.sync(`${twoLocations}/**/partials/**/*.liquid`).filter(file => FlatConfig.some(element => file.includes(`/${element}/`)))
  allJsonSchema = glob.sync(`${twoLocations}/**/{schema,_schema}/**/*.{js,json}`)
})

module.exports = (file, options) => {
  const timer = new BuildTime()
  // if file is a relative path... use caller() to determine path of parent file and set relative path to that file
  let globStr
  options?.globStr ? globStr = options.globStr : globStr = `${twoLocations}/`

  if (file.includes('./')) {
    globStr = `${twoLocations}/${path.dirname(caller()).split('src/')[1]}`
    file = path.basename(file)
  }
  // if we have found this file already, return the cached version
  const fileHashObj = {
    file,
    globStr,
    options: {
      args: options?.args,
      delete: options?.delete,
      extend: options?.extend,
      loop: options?.loop,
      suffix: options?.suffix
    }
  }

  const fileHash = crypto.createHash('sha256').update(JSON.stringify(fileHashObj)).digest('hex')
  if (fileCache[fileHash]) {
    timer.report()
    return fileCache[fileHash]
  }
  let ref
  // check for file in our pre-globbed arrays
  if (globStr.includes('partials')) {
    ref = allLiquidPartials.filter(partial => partial.includes(`/${file}`))
  } else if (globStr.includes('schema') || file.includes('schema')) {
    ref = allJsonSchema.filter(schema => schema.includes(`/${file.replace('.{js,json}', '.js')}`))
  } else {
    ref = glob.sync(`${globStr}${file}`)
  }
  if (ref.length > 1) {
    // prefer the file from the src directory (ie client)
    ref = ref.filter(file => file.indexOf('node_modules') === -1)
    process.BUILD.clientFiles.push(ref[0])
  }

  if (ref.length === 0) {
    console.error(`Could not find file ${file}`)
    process.exit()
  }

  const filePath = path.resolve(process.cwd(), ref[0])
  const fileExt = path.extname(filePath)

  // read the contents of the file, use fs to read .liquid files, wrap with JSON.parse for .json files
  let content
  switch (fileExt) {
    case '.liquid':
      content = fs.readFileSync(filePath, 'utf8')
      break
    case '.json':
      try {
        content = replaceReferencedSchema(JSON.parse(fs.readFileSync(filePath)))
      } catch (error) {
        console.error(filePath, error)
        process.exit()
      }
      break
    default:
      content = require(filePath)
      break
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

  // cache the result
  fileCache[fileHash] = content

  if (options?.loader) {
    options.loader.addDependency(filePath)
  }

  timer.report()
  return fileCache[fileHash]
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
      if (entry.id !== ext[0]) return entry
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

global.processSchema = (content, options) => {
  content = JSON.parse(JSON.stringify(content))
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
  return content
}
