const path = require('path')
const fs = require('fs')

const patterns = {
  none: '',
  locales: 'locales/*',
  push: `locales/*
templates/*.json
config/settings_data.json
`,
  pull: `locales/*
**/*.liquid
assets/*
`
}

module.exports = function(command) {
  fs.writeFileSync(path.resolve(process.cwd(), './dist/.shopifyignore'), patterns[command])
}
