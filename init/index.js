/*
  npx theme-envy init --target=path/to/dest

  creates skeleton structure for src folder
    - Shopify directories
    - Adds "_features" and "_elements" directories
    - config files
*/
const path = require('path')
const fs = require('fs-extra')
const chalk = require('chalk')
const { ensureDirectories } = require('#EnsureDirectories')
const { setSettingsSchemaJs } = require('#Convert/functions.js')
const { ifShopifyThemeExists, copyStarterConfigFiles, addThemeEnvyFeatures, createSettingsSchema, createEmptySettingsData } = require('#Init/functions.js')

module.exports = function(opts = { target: './' }) {
  const target = path.resolve(process.cwd(), opts.target)

  const dest = path.join(target, 'src')

  fs.ensureDirSync(dest)

  ifShopifyThemeExists({ target, dest })

  // setup our Theme Envy directories
  ensureDirectories({ root: dest, envy: true })

  console.log(
    'Theme Envy directories created in ',
    chalk.green(dest)
  )

  copyStarterConfigFiles({ target })

  addThemeEnvyFeatures()

  // if settings_schema.json exists, convert it to settings_schema.js, else create empty settings_schema.js
  if (fs.existsSync(path.join(dest, 'config/settings_schema.json'))) {
    setSettingsSchemaJs({ sourceTheme: dest })
  } else {
    createSettingsSchema({ dest })
  }

  createEmptySettingsData({ dest })
}
