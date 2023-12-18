/**
  * @file Creates a .shopifyignore file in the outputPath directory based on the type of push specified in the argument.
  * @param {string} type - The type of ignore pattern to use: 'none', 'locales', 'push'
  */

const path = require('path')
const fs = require('fs')

const patterns = {
  none: '',
  locales: 'locales/*',
  push: `locales/*
templates/*.json
sections/*.json
config/settings_data.json
`,
}

module.exports = function(type) {
  if (!fs.existsSync(path.resolve(process.cwd(), 'dist'))) {
    fs.mkdirSync(path.resolve(process.cwd(), 'dist'))
  }
  fs.writeFileSync(path.resolve(process.cwd(), 'dist/.shopifyignore'), patterns[type])
}
