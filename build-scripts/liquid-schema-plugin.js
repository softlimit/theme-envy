const { sources } = require('webpack')
const replaceReferencedSchema = require('./replace-referenced-schema')
const BuildTime = require('./build-time')
const fs = require('fs')
const path = require('path')
const processPartials = require('./process-partials')

class LiquidSchemaPlugin {
  apply(compiler) {
    const pluginName = 'LiquidSchemaPlugin'
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
          const lazyMarkupFile = processPartials(fs.readFileSync(path.resolve(__dirname, 'lazy-section-markup.liquid'), 'utf8'))
          // "assets" is an object that contains all assets
          // in the compilation, the keys of the object are pathnames of the assets
          // and the values are file sources.

          // Iterating over all the assets and
          const sections = Object.fromEntries(Object.entries(assets).filter(([key]) => key.includes('.liquid') && key.includes('sections/')))
          Object.entries(sections).forEach(([pathname, source]) => {
            source = source.source().toString()
            // check for {% schema %} tags with a string in them, like {% schema 'filename' %}
            const schema = source.match(/{% schema '(.*)' %}/g) || source.match(/{% schema "(.*)" %}/g)
            // if there are no schema tags with a filename string, return
            if (!schema) return
            // regexp for a quoted string within our schema match
            const schemaFile = schema[0].match(/'(.*)'/)[1] || schema[0].match(/"(.*)"/)[1]

            // load the file export
            let schemaSource = ThemeRequire(schemaFile, { globStr: 'src/**/{schema,_schema}/' })
            // replace the {% schema %} tag with the schema string and update asset
            // replace our old softlimit type
            schemaSource = replaceReferencedSchema(schemaSource)
            // check for lazy schema and automatically wrap section in liquid lazy markup
            if (schemaSource.settings?.filter((setting) => setting.id === 'disable_lazy').length) {
              const markup = lazyMarkupFile.replace('<!-- SECTION CONTENT -->', source.slice(0, source.indexOf(schema[0])))
              source = `${markup}${source.slice(source.indexOf(schema[0]))}`
            }
            compilation.updateAsset(
              pathname,
              new sources.RawSource(source.replace(schema[0], formatSchema(schemaSource)))
            )
          })
          timer.report()
        }
      )
    })
  }
}

function formatSchema(schema) {
  return `{% schema %}
${JSON.stringify(schema, null, 2)}
{% endschema %}
`
}

module.exports = LiquidSchemaPlugin
