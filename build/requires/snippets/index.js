/**
  @file Pre-builds the theme-envy.liquid snippet and adds it to dist/snippets
*/

const fs = require('fs-extra')
const path = require('path')
require('./liquid-builders/theme-envy.liquid.build')

fs.ensureDirSync(path.resolve(ThemeEnvy.outputPath, 'snippets'))

fs.copyFileSync(path.resolve(__dirname, 'theme-envy.liquid'), path.resolve(ThemeEnvy.outputPath, 'snippets/theme-envy.liquid'))
