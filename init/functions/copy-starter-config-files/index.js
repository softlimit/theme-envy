/**
 * @file Copies starter config files to target directory during init command
 */

const path = require('path')
const fs = require('fs-extra')
const logSymbols = require('#LogSymbols')

module.exports = function({ target, opts }) {
  // copy config files
  const configSrc = path.resolve(__dirname, './configs')
  fs.copy(configSrc, target, err => {
    if (err) return console.error(err)
    console.log(`${logSymbols.success} Config files copied`
    )
    if (opts.store) {
      const themeConfig = fs.readFileSync(path.resolve(target, 'theme.config.js'), 'utf8')
      fs.writeFileSync(path.resolve(target, 'theme.config.js'), themeConfig.replace(/store: '.*'/, `store: '${opts.store}'`))
    }
  })

  // copy util starter files
  const utilsSrc = path.resolve(__dirname, './utils')
  fs.copy(utilsSrc, path.resolve(target, 'utils'), err => {
    if (err) return console.error(err)
    console.log(`${logSymbols.success} Utils starter files copied`)
  })

  // copy github deploy workflow
  const githubDeploySrc = path.resolve(__dirname, './.github/workflows/deploy.yml')
  fs.copy(githubDeploySrc, path.resolve(target, '.github/workflows/deploy.yml'), err => {
    if (err) return console.error(err)
    console.log(`${logSymbols.success} GitHub deploy workflow copied`)
  })
}
