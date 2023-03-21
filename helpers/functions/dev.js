/*
  * theme-envy dev starts development process and syncs with Shopify using the Shopify CLI
*/
const { spawn } = require('child_process')
const path = require('path')

module.exports = function() {
  const relativeDistPath = path.relative(process.cwd(), ThemeEnvy.outputPath)
  const shopifyDev = `shopify theme dev --store=${ThemeEnvy.store} --path=${relativeDistPath}`
  const build = 'theme-envy build development --watch'
  spawn('stmux', ['-w', 'always', '-e', 'ERROR', '-M', '-m', 'beep,system', '--', '[', '[', shopifyDev, '..', build, ']', ']'], { stdio: 'inherit' })
}
