/*
  * theme-envy dev starts development process and syncs with Shopify using the Shopify CLI
*/
const { spawn } = require('child_process')

module.exports = function() {
  const shopifyDev = `shopify theme dev --store=${ThemeEnvy.store} --path=dist`
  const build = 'theme-envy build development --watch'
  spawn('stmux', ['-w', 'always', '-e', 'ERROR', '-M', '-m', 'beep,system', '--', '[', '[', shopifyDev, '..', build, ']', ']'], { stdio: 'inherit' })
}
