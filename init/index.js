/*
  @param {target} [optional] string: --target --t: path to target directory to init shopify theme envy files, defaults to current user directory
  @param [optional]: --example-feature --ef: outputs example feature structure and dummy files with readme documentation in each subdirectory

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
const { setSettingsSchemaJs } = require('#Convert/functions')
const {
  ifShopifyThemeExists,
  copyStarterConfigFiles,
  addThemeEnvyFeatures,
  createSettingsSchema,
  createEmptySettingsData,
  copyExampleFeature
} = require('#Init/functions')

module.exports = function(source, opts = {}) {
  const target = path.resolve(process.cwd(), (source || './'))

  const dest = path.join(target, 'src')

  fs.ensureDirSync(dest)

  ifShopifyThemeExists({ target, dest })

  // setup our Theme Envy directories
  ensureDirectories({ root: dest, envy: true })

  console.log(
    chalk.green.bold('Theme Envy directories'),
    'created in',
    chalk.green(dest)
  )

  copyStarterConfigFiles({ target })

  addThemeEnvyFeatures({ dest })

  // if settings_schema.json exists, convert it to settings_schema.js, else create empty settings_schema.js
  if (fs.existsSync(path.join(dest, 'config/settings_schema.json'))) {
    setSettingsSchemaJs({ sourceTheme: dest })
  } else {
    createSettingsSchema({ dest })
  }

  createEmptySettingsData({ dest })

  // if --example-feature or --ef flag is present, copy example-feature folder into _features
  if (opts.example) {
    copyExampleFeature({ dest })
  }
}
