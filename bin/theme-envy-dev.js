/*
  * theme-envy dev starts development process and syncs with Shopify using the Shopify CLI
*/
const path = require('path')
const { spawn } = require('child_process')

const ThemeConfig = require(path.resolve(process.cwd(), 'theme.config.js'))

module.exports = function(args, opts = { source: './', argv: {} }) {
  const shopifyDev = `shopify theme dev --store=${ThemeConfig.store} --path=dist`
  const build = 'npx theme-envy build --watch'
  spawn('stmux', ['-w', 'always', '-e', 'ERROR', '-M', '-m', 'beep,system', '--', '[', '[', shopifyDev, '..', build, ']', ']'], { stdio: 'inherit' })
}
