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
const { directories, ensureDirectories } = require(path.resolve(__dirname, '../build-scripts/helpers/ensure-directories'))
const configSrc = path.resolve(__dirname, '.././configs')

module.exports = function(args, opts = { target: './', feature: false }) {
  const target = path.resolve(process.cwd(), opts.target)

  fs.ensureDirSync(path.join(target, 'src'))

  const dest = path.join(target, 'src')

  // setup our Theme Envy directories
  ensureDirectories({ root: dest, envy: true })

  // if we have a valid Shopify theme structure in the target directory move those files to the dest
  const rootDirs = fs.readdirSync(target).filter(res => !res.includes('.'))
  const shopifyThemeExistsInRoot = directories.every(dir => rootDirs.includes(dir))
  if (shopifyThemeExistsInRoot) {
    directories.forEach(dir => {
      fs.moveSync(path.join(target, dir), path.join(dest, dir))
    })
  }

  console.log(
    'Theme Envy directories created in ',
    chalk.green(dest)
  )

  // create settings_schema.js
  const settingsSchema = path.join(dest, 'config/settings_schema.js')
  const settingsSchemaMarkup = `module.exports = [
  {
    name: 'theme_info',
    theme_name: 'Theme Envy',
    theme_version: '1.0.0',
    theme_author: 'Softlimit',
    theme_documentation_url: 'http://www.softlimit.com',
    theme_support_url: 'http://www.softlimit.com'
  }
]
`

  fs.writeFile(settingsSchema, settingsSchemaMarkup, 'utf8', (err) => {
    if (err) throw err
    console.log(
      'settings_schema.js created in ',
      chalk.green(dest)
    )
  })

  // create settings_data.json
  const settingsData = path.join(dest, 'config/settings_data.json')
  fs.writeFile(settingsData, '{}', 'utf8', (err) => {
    if (err) throw err
    console.log(
      'settings_data.json created in ',
      chalk.green(dest)
    )
  })

  // copy config files
  fs.copy(configSrc, target, err => {
    if (err) return console.error(err)
    console.log(
      'config files copied to ',
      chalk.green(target)
    )
  })
}
