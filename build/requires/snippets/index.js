/*
  Creates/copies theme-envy snippet in dist/snippets during build
*/
const fs = require('fs-extra')
const path = require('path')
require('./liquid-builders/theme-envy.liquid.build')

fs.ensureDirSync(path.resolve(ThemeEnvy.outputPath, 'snippets'))

fs.copyFileSync(path.resolve(__dirname, 'theme-envy.liquid'), path.resolve(ThemeEnvy.outputPath, 'snippets/theme-envy.liquid'))
