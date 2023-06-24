/**
  * @file A function that pulls the JSON files from Shopify and copies them to the theme directory.
  * @example
  * npx theme-envy pull-json
  * @returns {Void}
  */

const glob = require('glob')
const path = require('path')
const fs = require('fs-extra')
const { spawn } = require('child_process')

module.exports = function() {
  const relativeDistPath = path.relative(process.cwd(), ThemeEnvy.outputPath)
  const themePull = ['theme', 'pull', `--store=${ThemeEnvy.store}`, `--path=${relativeDistPath}`, '--only=settings_data.json', '--only=templates/*.json']
  const shopify = spawn('shopify', themePull, { cwd: path.resolve(process.cwd()), stdio: 'inherit' })

  shopify.on('exit', function() {
    const files = glob.sync(path.resolve(ThemeEnvy.outputPath, '{templates,config,sections}/**/*.json')).filter(file => file.indexOf('settings_schema') === -1)
    files.forEach(file => fs.copyFileSync(file, file.replace(ThemeEnvy.outputPath, ThemeEnvy.themePath)))
  })
}
