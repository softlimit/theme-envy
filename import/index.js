/*
  Usage: npx theme-envy import path/to/theme
  Imports an existing Shopify theme into a destination directory (default: "./src")
  Converts settings_schema.json to settings_schema.js
  If you supply the --convert flag, it will also convert the theme sections to _features, add hooks and install theme-envy feature
*/
const path = require('path')
const fs = require('fs-extra')
const { directories, ensureDirectories } = require('#EnsureDirectories')
const themeEnvyConvert = require('#Convert')
const { setSettingsSchemaJs } = require('#Convert/functions')
const { copyStarterConfigFiles, addThemeEnvyFeatures } = require('#Init/functions')
const { importFromGit, validateSourceTheme } = require('#Import/functions')

module.exports = async function({ argv }) {
  let source = argv.args[0]
  const destination = 'src'
  const convert = argv.C || argv.convert

  if (source.includes('.git')) {
    source = await importFromGit({ source, destination })
  }

  const sourceTheme = path.resolve(process.cwd(), source)
  const destTheme = path.resolve(process.cwd(), destination)
  validateSourceTheme({ sourceTheme })

  // Create directories _features and _elements
  ensureDirectories({ root: destTheme, envy: true })

  // Copy files from source to destination
  if (sourceTheme !== destTheme) {
    directories.forEach(dir => {
      fs.copySync(path.resolve(sourceTheme, dir), path.resolve(destTheme, dir))
    })
  }

  // convert settings_schema.json to settings_schema.js
  setSettingsSchemaJs({ sourceTheme: destTheme })

  copyStarterConfigFiles({ target: process.cwd() })

  if (convert) {
    addThemeEnvyFeatures({ dest: destTheme })
    await themeEnvyConvert({ argv: { source: destTheme } })
  }
}
