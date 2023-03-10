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
const { directories, ensureDirectories } = require('#EnsureDirectories')
const { setSettingsSchemaJs } = require('#Convert/functions')
const themeEnvyConvert = require('#Convert')
const {
  ifShopifyThemeExists,
  copyStarterConfigFiles,
  addThemeEnvyFeatures,
  createSettingsSchema,
  createEmptySettingsData,
  copyExampleFeature,
  importFromGit,
  validateSourceTheme
} = require('#Init/functions')

module.exports = async function(source, opts = {}) {
  const target = path.resolve(process.cwd())

  const dest = path.join(target, 'src')
  fs.ensureDirSync(dest)

  if (source) {
    // we have a source directory, so we're importing a theme from a folder that is not the root
    if (source.includes('.git')) {
      source = await importFromGit({ source, dest })
    }
    const sourceTheme = path.resolve(process.cwd(), source)
    const destTheme = path.resolve(process.cwd(), dest)
    validateSourceTheme({ sourceTheme })
    // Copy files from source to destination
    if (sourceTheme !== destTheme) {
      directories.forEach(dir => {
        fs.copySync(path.resolve(sourceTheme, dir), path.resolve(destTheme, dir))
      })
    }
  } else {
    // if no source directory is provided, check if there is a Shopify theme in the current directory and move it to /src
    ifShopifyThemeExists({ target, dest })
  }

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

  // only runs if settings_data.json does not exist
  createEmptySettingsData({ dest })

  // if --example or --e flag is present, copy example-feature folder into _features
  if (opts.example) {
    copyExampleFeature({ dest })
  }

  if (opts.convert) {
    await themeEnvyConvert({ source: dest, addThemeEnvy: false })
  }
}
