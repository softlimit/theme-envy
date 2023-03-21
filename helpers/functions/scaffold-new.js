/*
  theme new feature|element feature-name all|sections|snippets|scripts|schema|install|styles|config
  creates a directory in _features or _elements with starter files to build your feature or element
*/
const fs = require('fs-extra')
const path = require('path')
const chalk = require('chalk')
const logSymbols = require('#LogSymbols')

const starterConfigs = {
  config: 'starter-config.js',
  install: 'starter-install.js',
  schema: 'starter-schema.js',
  script: 'starter-script.js',
  section: 'starter-section.js',
}

// returns starter content of file name
// checks for file in user root first, otherwise use package file
const starterContent = (fileName, args) => {
  const fileExists = fs.existsSync(path.join(process.cwd(), '/utils/', fileName))
  if (!fileExists) {
    console.log(logSymbols.error, chalk.red('Error:'), `Starter file ${fileName} not found`)
    process.exit()
  }
  const content = require(path.join(process.cwd(), '/utils/', fileName))
  return content(...args)
}

module.exports = function(type, name, include) {
  console.log(logSymbols.info, chalk.cyan('Creating new'), chalk.green.bold(name), chalk.underline.bold(type), chalk.cyan('...'))
  const ELEMENTS = path.resolve(ThemeEnvy.themePath, '_elements')
  const FEATURES = path.resolve(ThemeEnvy.themePath, '_features')

  const starters = include?.split(',') || 'all'

  function upperFirstLetter(string) {
    return string[0].toUpperCase() + string.substring(1)
  }
  const DIRS = []
  const EXT_NAME = name.toLowerCase()
  const INCLUDE_ANY = starters
  const INCLUDE_ALL = INCLUDE_ANY && starters.includes('all')
  const INCLUDE_SCRIPT = INCLUDE_ANY && (starters.includes('scripts') || INCLUDE_ALL)
  const INCLUDE_STYLE = INCLUDE_ANY && (starters.includes('styles') || INCLUDE_ALL)
  const INCLUDE_INSTALL = INCLUDE_ANY && (starters.includes('install') || INCLUDE_ALL)
  const INCLUDE_SECTION = INCLUDE_ANY && (starters.includes('sections') || INCLUDE_ALL)
  const INCLUDE_SNIPPET = INCLUDE_ANY && (starters.includes('snippets') || INCLUDE_ALL)
  const INCLUDE_CONFIG = INCLUDE_ANY && (starters.includes('config') || INCLUDE_ALL)
  const INCLUDE_SCHEMA = INCLUDE_ANY && (starters.includes('schema') || INCLUDE_ALL)
  const EXT_COMPONENT_NAME = EXT_NAME.indexOf('-') > -1 ? EXT_NAME : EXT_NAME + '-component'
  const EXT_CLASS_NAME = EXT_COMPONENT_NAME.split('-').map(part => upperFirstLetter(part)).join('')
  const EXT_READABLE_NAME = EXT_COMPONENT_NAME.split('-').map(part => upperFirstLetter(part)).join(' ')

  // import strings
  let scriptImport = ''
  let styleImport = ''

  /*
  DEFAULT FILE CONTENTS & import strings
*/

  const FILES = {}

  if (INCLUDE_CONFIG) {
    DIRS.push('config')

    FILES[`config/${EXT_NAME}.json`] = starterContent(starterConfigs.config, [EXT_READABLE_NAME])
  }

  if (INCLUDE_SCHEMA) {
    DIRS.push('schema')
    FILES[`schema/schema-${EXT_NAME}.js`] = starterContent(starterConfigs.schema, [EXT_NAME, EXT_READABLE_NAME])
  }

  if (INCLUDE_INSTALL) {
    FILES['install.json'] = starterContent(starterConfigs.install, [EXT_NAME])
  }
  if (INCLUDE_SCRIPT) {
    scriptImport = `import './scripts/${EXT_NAME}.js'
`
    DIRS.push('scripts')
    FILES[`scripts/${EXT_NAME}.js`] = starterContent(starterConfigs.script, [EXT_NAME, EXT_CLASS_NAME])
  }
  if (INCLUDE_STYLE) {
    styleImport = `import './styles/${EXT_NAME}.css'
`
    DIRS.push('styles')
    const COMPONENT_CSS = `${EXT_COMPONENT_NAME} {

}`
    FILES[`styles/${EXT_NAME}.css`] = INCLUDE_SCRIPT ? COMPONENT_CSS : ''
  }
  if (INCLUDE_SECTION) {
    DIRS.push('sections')
    const TAG = INCLUDE_SCRIPT ? EXT_COMPONENT_NAME : 'div'
    FILES[`sections/${EXT_NAME}.liquid`] = starterContent(starterConfigs.section, [TAG, EXT_NAME])
  }

  if (INCLUDE_SNIPPET) {
    DIRS.push('snippets')
    FILES[`snippets/${EXT_NAME}.liquid`] = ''
  }

  FILES['index.js'] = `${scriptImport}${styleImport}`

  function loadDir(location) {
    if (fs.existsSync(path.resolve(location, EXT_NAME))) {
      console.log(logSymbols.error, chalk.red('Error:'), `Feature ${EXT_NAME} already exists. Rename or update feature directly instead.`)
      process.exit()
    }
    fs.mkdirSync(path.resolve(location, EXT_NAME))

    for (const DIR of DIRS) {
      fs.mkdirSync(path.resolve(location, EXT_NAME, DIR))
    }

    for (const FILE of Object.entries(FILES)) {
      fs.writeFileSync(path.resolve(location, EXT_NAME, FILE[0]), FILE[1], (err) => {
        if (err) throw new Error(`${logSymbols.error} Error creating file ${FILE[0]}`)
      })
    }

    console.log(`${logSymbols.success} ${chalk.green.bold(EXT_NAME)} created\n ${chalk.dim(location)}`)
  }

  type === 'element' ? loadDir(ELEMENTS) : loadDir(FEATURES)
}
