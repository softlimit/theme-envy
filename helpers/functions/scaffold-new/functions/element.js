const path = require('path')
const fs = require('fs-extra')
const upperFirstLetter = require('./upper-first-letter')
const starterContent = require('./starter-content')
const { starterConfigs } = require('../objects')

module.exports = (name) => {
  const ELEMENTS = path.resolve(ThemeEnvy.themePath, 'theme-envy/elements')
  const EXT_NAME = name.toLowerCase()

  const EXT_COMPONENT_NAME = EXT_NAME.indexOf('-') > -1 ? EXT_NAME : EXT_NAME + '-component'
  const EXT_CLASS_NAME = EXT_COMPONENT_NAME.split('-').map(part => upperFirstLetter(part)).join('')

  fs.writeFileSync(path.resolve(ELEMENTS, `${EXT_NAME}.js`), starterContent(starterConfigs.element, [EXT_NAME, EXT_CLASS_NAME]))
}
