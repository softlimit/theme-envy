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
const { ifShopifyThemeExists, copyStarterConfigFiles, addThemeEnvyFeatures, createSettingsSchema, createEmptySettingsData } = require('#Init')

module.exports = function(args, opts = { target: './', feature: false }) {
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

  createSettingsSchema({ dest })

  createEmptySettingsData({ dest })
}
