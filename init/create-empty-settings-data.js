const path = require('path')
const fs = require('fs-extra')
const chalk = require('chalk')

module.exports = function({ dest }) {
  // create settings_data.json
  const settingsData = path.join(dest, 'config/settings_data.json')
  if (!fs.existsSync(settingsData)) {
    fs.writeFile(settingsData, '{}', 'utf8', (err) => {
      if (err) throw err
      console.log(
        'settings_data.json created in ',
        chalk.green(dest)
      )
    })
  }
}
