const path = require('path')
const fs = require('fs-extra')

module.exports = function({ sourceTheme }) {
  // Set config/settings_schema to .js if settings_schema is json
  const settingsSchema = path.resolve(sourceTheme, 'config/settings_schema.json')
  if (fs.existsSync(settingsSchema)) {
    // rename settings_schema.json to settings_schema.js
    fs.writeFileSync(path.resolve(sourceTheme, 'config/settings_schema.json'), `module.exports = ${JSON.stringify(require(settingsSchema), null, 2)}`)
    fs.renameSync(settingsSchema, path.resolve(sourceTheme, 'config/settings_schema.js'))
  }
}
