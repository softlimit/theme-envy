/*
  Creates/copies theme-envy snippet in dist/snippets during build
*/
const fs = require('fs-extra')
const path = require('path')
const dist = path.resolve(process.cwd(), 'dist')

fs.ensureDirSync(path.resolve(dist, 'snippets'))

fs.copyFileSync(path.resolve(__dirname, 'theme-envy.liquid'), path.resolve(dist, 'snippets/theme-envy.liquid'))
