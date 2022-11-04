const BuildTime = require('./build-time')
class RemoveFilesPlugin {
  apply(compiler) {
    const pluginName = 'RemoveFilesPlugin'
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
          Object.entries(assets).forEach(entry => {
            if (entry[0].indexOf('assets/theme_build.js') > -1) {
              compilation.deleteAsset(entry[0])
            }
          })
          timer.report()
        }
      )
    })
  }
}

module.exports = RemoveFilesPlugin
