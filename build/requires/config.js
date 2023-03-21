const path = require('path')
const fs = require('fs-extra')
const { getAll } = require('#Build/functions')
const requiredModules = []
// glob all our config/*.js files
const writeSettingsSchema = () => {
  const settingsSchemaPath = path.resolve(ThemeEnvy.themePath, 'config/settings_schema.js')
  const settingsSchema = require(settingsSchemaPath)
  if (requiredModules.indexOf(settingsSchemaPath) === -1) requiredModules.push(settingsSchemaPath)
  const globbedConfigs = getAll('config')
    .map(file => {
      if (requiredModules.indexOf(file) === -1) requiredModules.push(file)
      return require(file)
    })
    .flat()
    // sort alphabetically by name
    .sort((a, b) => (a.name > b.name) ? 1 : -1)

  const config = [...settingsSchema, ...globbedConfigs].flat()

  fs.ensureDirSync(path.resolve(ThemeEnvy.outputPath, 'config'))
  fs.writeFileSync(path.resolve(ThemeEnvy.outputPath, 'config/settings_schema.json'), JSON.stringify(config, null, 2))
  fs.copyFileSync(path.resolve(ThemeEnvy.themePath, 'config/settings_data.json'), path.resolve(ThemeEnvy.outputPath, 'config/settings_data.json'))
  // update progress bar
  ThemeEnvy.progressBar.increment()
}

writeSettingsSchema()

ThemeEnvy.events.on('watch:start', () => {
  // clear node cache of ThemeRequired modules
  requiredModules.forEach(module => {
    delete require.cache[require.resolve(module)]
  })
  requiredModules.length = 0
  writeSettingsSchema()
})
