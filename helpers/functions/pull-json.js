const glob = require('glob')
const path = require('path')
const fs = require('fs')
const { exec, spawn } = require('child_process')
const { themeIgnore } = require('./theme-ignore')

module.exports = function() {
  themeIgnore('pull')
  exec('cd dist')
  const shopify = spawn('shopify', ['theme', 'pull'], { cwd: path.resolve(process.cwd(), 'dist'), stdio: 'inherit' })

  shopify.on('exit', function() {
    const files = glob.sync(path.resolve(process.cwd(), 'dist/{templates,config}/**/*.json'))
    files.forEach(file => {
      if (file.indexOf('settings_schema') > -1) return
      fs.copyFileSync(file, file.replace('/dist/', '/src/'))
    })
  })
}
