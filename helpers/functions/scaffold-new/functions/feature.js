const path = require('path')
const loadDir = require('./load-dir')
const upperFirstLetter = require('./upper-first-letter')
const starterContent = require('./starter-content')
const { starterConfigs } = require('../objects')

module.exports = (name, include) => {
  const FEATURES = path.resolve(ThemeEnvy.themePath, '_features')
  const starters = include?.split(',') || 'all'

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

    FILES[`config/${EXT_NAME}.js`] = starterContent(starterConfigs.config, [EXT_READABLE_NAME])
  }

  if (INCLUDE_SCHEMA) {
    DIRS.push('schema')
    FILES[`schema/schema-${EXT_NAME}.js`] = starterContent(starterConfigs.schema, [EXT_NAME, EXT_READABLE_NAME])
  }

  if (INCLUDE_INSTALL) {
    FILES['install.js'] = starterContent(starterConfigs.install, [EXT_NAME])
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

  loadDir({ location: FEATURES, DIRS, EXT_NAME, FILES })
}
