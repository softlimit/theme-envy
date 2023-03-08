const path = require('path')
const fs = require('fs-extra')
const chalk = require('chalk')

module.exports = function({ dest }) {
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
      chalk.green.bold('settings_schema.js'),
      'created in',
      chalk.green(dest)
    )
  })
}
