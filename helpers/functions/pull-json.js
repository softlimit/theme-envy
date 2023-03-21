const glob = require('glob')
const path = require('path')
const fs = require('fs')
const { spawn } = require('child_process')

module.exports = function() {
  const themePull = ['theme', 'pull', `--store=${ThemeEnvy.store}`, '--path=dist', '--only=templates/*.json,config/settings_data.json,sections/*.json']
  const shopify = spawn('shopify', themePull, { cwd: path.resolve(process.cwd(), 'dist'), stdio: 'inherit' })

  shopify.on('exit', function() {
    const files = glob.sync(path.resolve(ThemeEnvy.outputPath, '{templates,config,sections}/**/*.json')).filter(file => file.indexOf('settings_schema') > -1)
    files.forEach(file => fs.copyFileSync(file, file.replace(ThemeEnvy.outputPath, ThemeEnvy.themePath)))
  })
}
