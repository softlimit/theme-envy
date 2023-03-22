/**
 * @file Pre-processes .liquid files to allow for our custom tags: partial, hook, and theme
 * @example
 * // partial tag copies the contents of _cart-item-title.liquid
 * {% partial '_cart-item-title' %}
 * @example
 * // adds a hook (point) to the liquid file that can be injected to from install.js files
 * {% hook 'cart-item-title' %}
 * @example
 * // references any object in the theme.config.js file
 * {% theme 'breakpoints.md' %}
*/

const path = require('path')
const fs = require('fs-extra')
const listDependencies = require('./list-dependencies')
const getAll = require('#Build/functions/get-all.js')
const globbedPartials = getAll('partials')

const strings = {
  tags: ['partial', 'hook', 'theme']
}
// build list of strings to test for replacing
strings.test = strings.tags.map(tag => [`${tag} '`, `${tag} "`]).flat()

const extendLiquid = ({ source, filePath }) => {
  // return source if no tags are found
  if (!source) return source
  if (!strings.test.some(str => source.includes(str))) return source
  // regexp for partials and hooks within liquid tags
  const tags = /{%[-]?\s*((partial|hook|theme)\s['|"](\S*)['|"])\s*[-]?%}/gm
  const inLiquid = /(?<!{%[-]?\s)((partial|hook)\s['|"](.*)['|"])/gm
  const foundTags = [...source.matchAll(tags), ...source.matchAll(inLiquid)]
  // gather dependencies, will be used to trigger rebuilds
  const dependencies = listDependencies({ source, filePath })
  ThemeEnvy.dependencies[filePath] = dependencies

  foundTags.forEach(tag => {
    source = replaceTag({ tag, source, filePath })
  })
  return source
}

function replaceTag({ tag, source, filePath } = {}) {
  // we will replace tag[0] with the file contents
  const replace = tag[0]
  const action = tag[2]
  const name = tag[3]
  if (action === 'partial') {
    const partialPath = globbedPartials.filter(partial => partial.includes(`/${`${name}.liquid`}`))[0]
    const partialSource = fs.readFileSync(partialPath, 'utf8')
    const file = extendLiquid({ source: partialSource, filePath: partialPath })
    source = source.replace(replace, whitespace(replace, file))
  }
  if (action === 'hook') {
    const replacedContent = ThemeEnvy.hooks[name] ? extendLiquid({ source: ThemeEnvy.hooks[name].content, filePath }) : ''
    if (ThemeEnvy.hooks[name]) ThemeEnvy.hooks[name].replaced = true
    source = source.replace(replace, replacedContent)
  }
  if (action === 'theme') {
    // defines all properties available to {% theme name.key %} tags
    const Theme = require(path.resolve(process.cwd(), 'theme.config.js'))
    const [obj, key] = name.split('.')
    source = source.replace(replace, Theme[obj][key])
  }
  return source
}

function whitespace(replace, source) {
  const trimLeft = replace.includes('{%-')
  const trimRight = replace.includes('-%}')
  if (trimLeft) source = source.trimStart()
  if (trimRight) source = source.trimEnd()
  return source
}

module.exports = extendLiquid
