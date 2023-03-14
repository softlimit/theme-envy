/*
  * theme-envy dev starts development process and syncs with Shopify using the Shopify CLI
*/
const path = require('path')
const { spawn } = require('child_process')

module.exports = function() {
  const ThemeConfig = require(path.resolve(process.cwd(), 'theme.config.js'))
  const shopifyDev = `shopify theme dev --store=${ThemeConfig.store} --path=dist`
  const build = 'theme-envy build development --watch'
  spawn('stmux', ['-w', 'always', '-e', 'ERROR', '-M', '-m', 'beep,system', '--', '[', '[', shopifyDev, '..', build, ']', ']'], { stdio: 'inherit' })
}
