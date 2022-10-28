/*
  npm run init-new feature|element feature-name all|sections|snippets|scripts|schema|installs|styles|config
  creates a directory in _features or _elements with starter files to build your feature or element
*/
const fs = require('fs')
const path = require('path')
const yargs = require('yargs')

module.exports = function() {
  const argv = yargs(process.argv.slice(3))
    .command('$0 <type> <name> [includes]', 'Create new feature/element', {
      type: {
        description: 'feature or element',
        type: 'string'
      },
      name: {
        description: 'Name of feature/element, do not include spaces',
        type: 'string'
      },
      includes: {
        description: 'List of all subfolders and starter files. Options: ["all", "config", "install", "schema", "scripts", "sections", "snippets", "styles"]. Format as comma separated list (no spaces, no quotes)',
        type: 'string'
      }
    },
    (argv) => {
      argv.includes = argv.includes ? argv.includes.split(',') : null
      console.log(`Creating ${argv.type} ${argv.name}, include ${argv.includes} starter files`)
    })
    .help()
    .showHelpOnFail(true)
    .argv

  const ELEMENTS = path.resolve(process.cwd(), 'src/_elements')
  const FEATURES = path.resolve(process.cwd(), 'src/_features')

  if (!argv.name) throw new Error('Please provide an feature or element name as the first argument, ex: new-section')

  function upperFirstLetter(string) {
    return string[0].toUpperCase() + string.substring(1)
  }
  const DIRS = []
  const EXT_NAME = argv.name.toLowerCase()
  const INCLUDE_ANY = argv.includes
  const INCLUDE_ALL = INCLUDE_ANY && argv.includes.includes('all')
  const INCLUDE_SCRIPT = INCLUDE_ANY && (argv.includes.includes('scripts') || INCLUDE_ALL)
  const INCLUDE_STYLE = INCLUDE_ANY && (argv.includes.includes('styles') || INCLUDE_ALL)
  const INCLUDE_INSTALL = INCLUDE_ANY && (argv.includes.includes('install') || INCLUDE_ALL)
  const INCLUDE_SECTION = INCLUDE_ANY && (argv.includes.includes('sections') || INCLUDE_ALL)
  const INCLUDE_SNIPPET = INCLUDE_ANY && (argv.includes.includes('snippets') || INCLUDE_ALL)
  const INCLUDE_CONFIG = INCLUDE_ANY && (argv.includes.includes('config') || INCLUDE_ALL)
  const INCLUDE_SCHEMA = INCLUDE_ANY && (argv.includes.includes('schema') || INCLUDE_ALL)
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

    FILES[`config/${EXT_NAME}.json`] = `[
  {
    "name": "${EXT_READABLE_NAME}",
    "settings": [
      
    ]
  }
]
`
  }

  if (INCLUDE_SCHEMA) {
    DIRS.push('schema')
    FILES[`schema/schema-${EXT_NAME}.js`] = `module.exports = {
  name: '${EXT_READABLE_NAME}',
  tag: 'section',
  class: '${EXT_NAME}',
  settings: [],
  presets: [
    {
      name: '${EXT_READABLE_NAME}',
      category: 'General',
      settings: {},
    },
  ],
}
`
  }

  if (INCLUDE_INSTALL) {
    FILES['install.json'] = `[
  {
    "hook": "hook-body-end",
    "content": "{% render '${EXT_NAME}' %}"
  }
]`
  }
  if (INCLUDE_SCRIPT) {
    scriptImport = `import './scripts/${EXT_NAME}.js'
`
    DIRS.push('scripts')
    FILES[`scripts/${EXT_NAME}.js`] = `class ${EXT_CLASS_NAME} extends HTMLElement {
  constructor () {
    super()
    console.log(this)
  }
}
customElements.define('${EXT_COMPONENT_NAME}', ${EXT_CLASS_NAME})
`
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
    FILES[`sections/${EXT_NAME}.liquid`] = `<!-- softlimit { "action": "partial", "file": "section-spacing-y" } -->
<${TAG} class="{{ sectionSpacingY }} {{ section.settings.custom_classes }}"{{ sectionColorStyle }}>
  <div class="{% unless section.settings.full_width %}page-width {% endunless %}">
    
  </div>
</${TAG}>
{% schema 'schema-${EXT_NAME}.js' %}
`
  }

  if (INCLUDE_SNIPPET) {
    DIRS.push('snippets')
    FILES[`snippets/${EXT_NAME}.liquid`] = ''
  }

  FILES['index.js'] = `${scriptImport}${styleImport}`

  function loadDir(location) {
    console.log('loadDir', location)
    fs.mkdirSync(path.resolve(location, EXT_NAME))

    for (const DIR of DIRS) {
      fs.mkdirSync(path.resolve(location, EXT_NAME, DIR))
    }

    for (const FILE of Object.entries(FILES)) {
      fs.writeFileSync(path.resolve(location, EXT_NAME, FILE[0]), FILE[1], (err) => {
        if (err) throw new Error(`Error creating file ${FILE[0]}`)
      })
    }
  }

  argv.type === 'element' ? loadDir(ELEMENTS) : loadDir(FEATURES)
}
