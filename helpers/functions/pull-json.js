const glob = require('glob')
const path = require('path')
const fs = require('fs')
const { spawn } = require('child_process')

module.exports = function() {
  const ThemeConfig = require(path.resolve(process.cwd(), 'theme.config.js'))
  const themePull = ['theme', 'pull', `--store=${ThemeConfig.store}`, '--path=dist', '--only=templates/*.json,config/settings_data.json,sections/*.json']
  const shopify = spawn('shopify', themePull, { cwd: path.resolve(process.cwd(), 'dist'), stdio: 'inherit' })

  shopify.on('exit', function() {
    const files = glob.sync(path.resolve(process.cwd(), 'dist/{templates,config,sections}/**/*.json')).filter(file => file.indexOf('settings_schema') > -1)
    files.forEach(file => fs.copyFileSync(file, file.replace('/dist/', '/src/')))
  })
}
