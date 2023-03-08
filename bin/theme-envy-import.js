/*
  Usage: npx theme-envy import --(source|src|S)=path/to/theme
  Imports an existing Shopify theme into a destination directory (default: "./src")
  Converts settings_schema.json to settings_schema.js
  If you supply the --convert flag, it will also convert the theme sections to _features, add hooks and install theme-envy feature
*/
const path = require('path')
const fs = require('fs-extra')
const { directories, ensureDirectories } = require('#EnsureDirectories')
const themeEnvyConvert = require('./theme-envy-convert')
const { setSettingsSchemaJs } = require('#Convert')
const { copyStarterConfigFiles, addThemeEnvyFeatures } = require('#Init')
const git = require('simple-git')(process.cwd())

module.exports = async function(args, opts = { source: './', argv: {} }) {
  let { source, src, S, destination, dest, D, convert, C } = opts.argv
  source = source || src || S
  destination = destination || dest || D
  convert = convert || C

  if (source.includes('.git')) {
    // if source is a git repo, clone it to src directory
    const gitRepo = source
    source = path.resolve(process.cwd(), 'src')
    // set source to src directory so in sourceTheme assignment below, it will be the correct path
    source = 'src'
    await git.clone(gitRepo, source)
    // remove .git directory
    const remove = ['.git', '.github']
    remove.forEach(dir => {
      if (fs.existsSync(path.resolve(process.cwd(), source, dir))) fs.removeSync(path.resolve(process.cwd(), source, dir))
    })
  }

  const sourceTheme = path.resolve(process.cwd(), source)
  const destTheme = path.resolve(process.cwd(), (destination || 'src'))
  // verify source theme exists
  if (!fs.existsSync(sourceTheme)) {
    console.error(`Source theme directory not found: ${sourceTheme}`)
    process.exit(1)
  }

  // validate directory structure of source theme
  directories.forEach(dir => {
    if (!fs.existsSync(path.resolve(sourceTheme, dir))) {
      console.error(`Source theme required directory not found: ${path.resolve(sourceTheme, dir)}`)
      process.exit(1)
    }
  })

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

  if (convert) {
    copyStarterConfigFiles({ target: process.cwd() })
    addThemeEnvyFeatures({ sourceTheme: destTheme })
    await themeEnvyConvert(args, { argv: { source: destTheme } })
  }
}
