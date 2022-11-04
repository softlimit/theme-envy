const { sources } = require('webpack')
const _ = require('lodash')
const BuildTime = require('./build-time')
const replaceReferencedSchema = require('./replace-referenced-schema')
const path = require('path')
const Screens = require(path.resolve(process.cwd(), 'screens.config.js'))
const Theme = {
  breakpoints: Screens
}

const TARGET = 'config/settings_schema.json'

const strings = {
  softlimitStart: '<!-- softlimit',
  softlimitEnd: '-->',
}

class SettingsMergePlugin {
  apply(compiler) {
    const pluginName = 'SettingsMergePlugin'
    const { webpack } = compiler
    const { Compilation } = webpack

    compiler.hooks.thisCompilation.tap(pluginName, (compilation) => {
      compilation.hooks.processAssets.tap(
        {
          name: pluginName,

          // Using one of the later asset processing stages to ensure
          // that all assets were already added to the compilation by other plugins.
          stage: Compilation.PROCESS_ASSETS_STAGE_OPTIMIZE_INLINE
        },
        (assets) => {
          const timer = new BuildTime()
          // "assets" is an object that contains all assets
          // in the compilation, the keys of the object are pathnames of the assets
          // and the values are file sources.

          // Iterating over all the assets and
          const settings = Object.fromEntries(Object.entries(assets).filter(([key]) => key.includes('.json') && key.includes('config/') && !key.includes('settings_')))
          // get main settings
          if (!compilation.getAsset(TARGET)?.source) {
            throw new Error('SettingsMergePlugin: Could not find settings_schema.json file')
          }
          const settingsSchema = JSON.parse(compilation.getAsset(TARGET).source.source().toString())
          // collect additional settings
          let mergedSettings = []
          Object.entries(settings).forEach(([pathname, source, info]) => {
            mergedSettings = _.values(_.merge(
              _.keyBy(mergedSettings, 'name'),
              _.keyBy(JSON.parse(source.source().toString()), 'name')
            ))
            // remove unnecessary asset now that it has been merged
            compilation.deleteAsset(pathname)
          })
          // sort additional settings by name, alphabetically
          mergedSettings.sort((a, b) => (a.name > b.name) ? 1 : -1)
          // merge with original settings
          mergedSettings = _.values(_.merge(
            _.keyBy(settingsSchema, 'name'),
            _.keyBy(mergedSettings, 'name')
          ))

          // process and replace schema partial references in the settings object
          mergedSettings = replaceReferencedSchema(mergedSettings)
          let settingsString = JSON.stringify(mergedSettings, null, 4)

          // check for softlimit liquid tags... just the theme ones for now
          const regexStr = String.raw`${strings.softlimitStart}.*?${strings.softlimitEnd}`
          const search = RegExp(regexStr, 'gs')
          const matches = [...settingsString.matchAll(search)]
          matches.forEach(match => {
            const properties = getProperty(match[0])
            let themeVal = _.get(Theme, properties.property)
            if (typeof (themeVal) !== 'string') {
              themeVal = `${themeVal.value}${themeVal.numeratorUnits[0]}`
            }
            settingsString = settingsString.replace(match[0], themeVal)
          })

          compilation.updateAsset(
            TARGET,
            new sources.RawSource(settingsString)
          )
          timer.report()
        }
      )
    })
  }
}

function getProperty(match) {
  const indexStart = match.indexOf(strings.softlimitStart)
  const indexEnd = match.indexOf(strings.softlimitEnd)
  // TODO: make it so we don't need to start the tags with curly braces, assume them
  const json = match.slice(indexStart + strings.softlimitStart.length, indexEnd)

  if (json.indexOf('{') === -1) {
    const jsonArr = json.trim().split('.')

    const jsonObject = {}
    jsonObject.action = (jsonArr[0] === 'this' ? 'sl_this' : jsonArr[0])
    // keep the rest of the call in 1 property
    if (jsonArr.length > 1) jsonObject.property = (jsonArr.shift(), jsonArr.join('.'))
    return jsonObject
  }

  return JSON.parse(json)
}

module.exports = SettingsMergePlugin
