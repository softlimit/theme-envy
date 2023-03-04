/*
  Usage: npx theme-envy import --(source|src|S)=path/to/theme
  Imports an existing Shopify theme into a destination directory (default: "./src")
  Converts settings_schema.json to settings_schema.js
  If you supply the --convert flag, it will also convert the theme sections to _features
*/
const path = require('path')
const fs = require('fs-extra')
const { ESLint } = require('eslint')
const { directories, ensureDirectories } = require(path.resolve(__dirname, '../build-scripts/helpers/ensure-directories'))
const themeEnvyConvert = require('./theme-envy-convert')

async function lint(file) {
  const eslint = new ESLint({ fix: true })

  // Lint files.
  const results = await eslint.lintFiles([file])
  await ESLint.outputFixes(results)
}

module.exports = async function(args, opts = { source: './', argv: {} }) {
  let { source, src, S, destination, dest, D, convert, C } = opts.argv
  source = source || src || S
  destination = destination || dest || D
  convert = convert || C
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

  // Set config/settings_schema to .js
  const settingsSchema = path.resolve(destTheme, 'config/settings_schema.json')
  // rename settings_schema.json to settings_schema.js
  fs.writeFileSync(path.resolve(destTheme, 'config/settings_schema.json'), `module.exports = ${JSON.stringify(require(settingsSchema), null, 2)}`)
  fs.renameSync(settingsSchema, path.resolve(destTheme, 'config/settings_schema.js'))
  await lint(path.resolve(destTheme, 'config/settings_schema.js'))

  if (convert) {
    await themeEnvyConvert(args, { argv: { source: destTheme } })
  }
}
