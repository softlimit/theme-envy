const chalk = require('chalk')
const fs = require('fs-extra')
const logSymbols = require('#LogSymbols')
const path = require('path')

module.exports = ({ location, DIRS, EXT_NAME, FILES }) => {
  if (fs.existsSync(path.resolve(location, EXT_NAME))) {
    console.log(logSymbols.error, chalk.red('Error:'), `Feature ${EXT_NAME} already exists. Rename or update feature directly instead.`)
    process.exit()
  }
  fs.ensureDirSync(path.resolve(location, EXT_NAME))

  for (const DIR of DIRS) {
    fs.ensureDirSync(path.resolve(location, EXT_NAME, DIR))
  }

  for (const FILE of Object.entries(FILES)) {
    fs.writeFileSync(path.resolve(location, EXT_NAME, FILE[0]), FILE[1], (err) => {
      if (err) throw new Error(`${logSymbols.error} Error creating file ${FILE[0]}`)
    })
  }

  console.log(`${logSymbols.success} ${chalk.green.bold(EXT_NAME)} created\n ${chalk.dim(location)}`)
}
