const fs = require('fs')
const parseSchema = require('./parse-schema')
const replaceReferencedSchema = require('./replace-referenced-schema')
const updateSchema = require('./update-schema')
const processPartials = require('./process-partials')
const BuildTime = require('./build-time')
const hookStrings = require('./hook-strings')

class ExtensionInstaller {
  apply(compiler) {
    const pluginName = 'ExtensionInstaller'
    const { webpack } = compiler
    const { Compilation, sources } = webpack

    compiler.hooks.thisCompilation.tap(pluginName, (compilation) => {
      compilation.hooks.processAssets.tap(
        {
          name: pluginName,

          // Using one of the later asset processing stages to ensure
          // that all assets were already added to the compilation by other plugins.
          stage: Compilation.PROCESS_ASSETS_STAGE_OPTIMIZE_INLINE
        },
        () => {
          const timer = new BuildTime()
          const INSTALLS = process.BUILD.installs.map(file => {
            const extension = file.split('.').pop()
            if (extension === 'json') console.log('Theme is still using install.json files instead of install.js. Try running \'node node_modules/@softlimit/framework/utils/convert-json-js\' to resolve.')
            return require(file)
          }).flat()
          // reset installs, they will all be taken care of here
          const INSTALLS_SCHEMA = INSTALLS.filter(entry => !entry.hook)
          const INSTALLS_HOOKS = INSTALLS.filter(entry => entry.hook)
          const HOOK_DESTINATIONS = {}
          // group all hooks together by target file and hook
          // This is so we can install hooks once per destination file...
          INSTALLS_HOOKS.forEach(entry => {
            if (!process.BUILD.hooks[entry.hook]) {
              console.error('Hook does not exist: ' + entry.hook)
              throw new Error('Hook does not exist: ' + entry.hook)
            }
            process.BUILD.hooks[entry.hook].forEach(hook => {
              HOOK_DESTINATIONS[hook] = HOOK_DESTINATIONS[hook] || {}
              HOOK_DESTINATIONS[hook][entry.hook] = HOOK_DESTINATIONS[hook][entry.hook] || ''
              // add the hook to the destination, process entry.content for softlimit partials
              HOOK_DESTINATIONS[hook][entry.hook] += `${processPartials(entry.content)}\n`
            })
          })
          // loop through all hooks and replace them with their content
          Object.entries(HOOK_DESTINATIONS).forEach(entry => {
            const [target, hooks] = entry
            const asset = compilation.getAsset(target)
            if (!asset) {
              console.error(`File does not exist: ${target}, referenced in ${JSON.stringify(hooks)}`)
              throw new Error('File does not exist: ' + target)
            }
            let source = asset.source.source().toString()
            Object.entries(hooks).forEach(hook => {
              const [hookName, hookContent] = hook
              if (source.indexOf(hookStrings(hookName).hookClose()) === -1) {
                console.error(`Hook ${hookName} not found in ${target}`)
              }
              // regexp for multi-line content in between start and end strings
              const regexStr = String.raw`${hookStrings(hookName).hookOpen()}\n(.*?)\n${hookStrings(hookName).hookClose()}`
              const existingContent = [...source.matchAll(new RegExp(regexStr, 'gms'))][0][1]
              source = source.replace(new RegExp(regexStr, 'gms'), `${existingContent}\n${hookContent}`)
            })
            compilation.updateAsset(target, new sources.RawSource(source))
          })
          INSTALLS_SCHEMA.forEach(entry => {
            const file = `${entry.file}.liquid`
            const asset = compilation.getAsset(file)

            if (!asset) {
              if (entry.errors !== false) console.error(`File does not exist: ${file} from ${JSON.stringify(entry.content)}`)
              return
            }
            let source = asset.source.source().toString()
            // don't add it if the file already has the content
            if (source.indexOf(entry.content) > -1) return
            // add the content to the file
            if (entry.target) {
              // targeting section schema...
              const target = entry.target.split('.')[1]
              const schema = parseSchema(source, entry.file)
              // accessing property of schema, like blocks, add it to the array
              // make sure to replace any softlimit type references with replaceReferencedSchema
              const content = replaceReferencedSchema([entry.content], null, file)
              // don't do anything if we have an exact match
              if (JSON.stringify(schema[target]).includes(JSON.stringify(content[0]))) return
              // filter schema target (blocks) to make sure we do not have an identical block already
              if (target === 'blocks') {
                // we are targeting blocks, so let's filter by type not JSON stringify comparison
                schema[target] = schema[target].filter(item => item.type !== content[0].type)
              } else if (target === 'settings') {
                // check that stringified version of any entry matches, or if it has an ID that matches
                schema[target] = schema[target].filter(function(obj) {
                  return !content.some(function(obj2) {
                    return JSON.stringify(obj) === JSON.stringify(obj2) || (obj.id === obj2.id && obj.id !== undefined)
                  })
                })
              } else {
                schema[target] = schema[target].filter(item => JSON.stringify(item) !== JSON.stringify(content))
              }
              // add our content to the array (blocks)
              schema[target] = schema[target].concat(content)
              // update asset not writeFileSync
              source = updateSchema(source, schema)
            } else {
              source = `${source}\n${entry.content}`
            }
            compilation.updateAsset(file, new sources.RawSource(source))

            timer.report()
          })
        })
    })
  }
}
module.exports = ExtensionInstaller
