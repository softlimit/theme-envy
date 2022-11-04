/* eslint-disable camelcase */
const path = require('path')
const _ = require('lodash')
const flattenShopifyDirectoryStructure = require('./flatten-shopify-directory-structure')
const BuildTime = require('./build-time')
const Screens = require(path.resolve(process.cwd(), 'screens.config.js'))
const hookStrings = require('./hook-strings')
const Theme = {
  breakpoints: Screens
}

const strings = {
  startString: '<!-- softlimit',
  endString: '-->',
}

process.BUILD.events.on('build:complete', () => {
  // clear cache
})

process.BUILD.hooks = {}

module.exports = function(source) {
  if (source.indexOf(strings.startString) === -1) return source
  return checkSource(source, this)
}

const checkSource = (source, loader) => {
  const timer = new BuildTime()
  const matches = getSoftlimitTags(source)
  if (matches) {
    matches.forEach(match => {
      const property = getProperty(match[0])
      // replace match[0] with file contents
      source = source.replace(match[0], actions[property.action](property, loader))
    })
    if (getSoftlimitTags(source)) {
      source = checkSource(source, loader)
    }
  }
  timer.report()
  return source
}

const getSoftlimitTags = (source) => {
  const regexStr = String.raw`${strings.startString}.*?${strings.endString}`
  const search = RegExp(regexStr, 'gs')
  const matches = [...source.matchAll(search)]
  // get out of here if no matches
  if (!matches[0]) return false
  return matches
}

const getProperty = (string) => {
  const jsonRegex = /{(.*?)}/g
  const matches = [...string.matchAll(jsonRegex)]
  if (!matches[0]) {
    // regex for string between start and end strings, this happens when we reference a theme property like theme.breakpoints.md
    const regexStr = String.raw`${strings.startString}(.*?)${strings.endString}`
    const search = RegExp(regexStr, 'gs')
    const lookupArr = [...string.matchAll(search)][0][1].trim().split('.')
    const action = lookupArr[0]
    lookupArr.shift()
    const property = lookupArr.join('.')
    return {
      action,
      property
    }
  }
  const property = JSON.parse(matches[0][0])
  return property
}

const actions = {
  partial: (props, loader) => {
    const content = `${props.file !== 'colors' ? hookStrings(props.file).hookOpen() : ''}
${ThemeRequire(`${props.file}.liquid`, { globStr: './{src,node_modules/@softlimit/framework/src}/**/partials/', loader })}
${props.file !== 'colors' ? hookStrings(props.file).hookClose() : ''}
`
    addHook(props.file, loader)
    return content
  },
  render: (props, loader) => {
    // legacy function, almost everything is using 'partial'
    const content = `${hookStrings(props.snippet).hookOpen()}
${ThemeRequire(`${props.snippet}.liquid`, { globStr: './{src,node_modules/@softlimit/framework/src}/**/snippets/', loader })}
${hookStrings(props.snippet).hookClose()}
`
    addHook(props.snippet, loader)
    return content
  },
  theme: (props, loader) => {
    return _.get(Theme, props.property)
  }
}

const addHook = (hookName, loader) => {
  process.BUILD.hooks[hookName] = process.BUILD.hooks[hookName] || []
  const flattenedPath = flattenShopifyDirectoryStructure(loader.resourcePath)
  if (!process.BUILD.hooks[hookName].includes(flattenedPath)) {
    process.BUILD.hooks[hookName].push(flattenedPath)
  }
}
