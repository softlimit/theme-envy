const liquidPlugin = require('@shopify/prettier-plugin-liquid/standalone')
const BuildTime = require('./build-time')
const prettier = require('prettier/standalone')
const prettierFail = []
const prettierSuccess = []
class HookCommentRemoverPlugin {
  apply(compiler) {
    const pluginName = 'HookCommentRemoverPlugin'
    const { webpack } = compiler
    const { Compilation, sources } = webpack

    compiler.hooks.thisCompilation.tap(pluginName, (compilation, callback) => {
      compilation.hooks.processAssets.tap(
        {
          name: pluginName,
          // Using one of the later asset processing stages to ensure
          // that all assets were already added to the compilation by other plugins.
          stage: Compilation.PROCESS_ASSETS_STAGE_OPTIMIZE_SIZE
        },
        (assets) => {
          const timer = new BuildTime()
          const liquidFiles = Object.fromEntries(Object.entries(assets).filter(([key]) => key.includes('.liquid')))
          Object.entries(liquidFiles).forEach(([pathname, source]) => {
            // don't process files with a buffer, they haven't changed
            if (source.getCachedData && source.getCachedData().buffer) {
              compilation.deleteAsset(pathname)
              return
            }
            // erase hook comments
            source = source.source().toString()

            // regexp to remove all empty lines
            source = source.replace(/^\s*\n/gm, '')

            // run prettier
            source = prettify(source, pathname)
            compilation.updateAsset(pathname, new sources.RawSource(source))
          })
          if (prettierSuccess.length > 0) console.log(`${prettierSuccess.length} files successfully prettified`)
          if (prettierFail.length > 0) console.log('These files could not be prettified:', prettierFail.sort())
          timer.report()
        })
    })
  }
}

function prettify(source, pathname) {
  if (process.env.mode !== 'production') return source
  let prettified = false
  try {
    prettified = prettier.format(source, { plugins: [liquidPlugin], parser: 'liquid-html' })
    prettierSuccess.push(pathname)
  } catch (error) {
    prettierFail.push(pathname)
  }
  if (prettified) source = prettified
  return source
}

module.exports = HookCommentRemoverPlugin
