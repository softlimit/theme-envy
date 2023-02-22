const glob = require('glob')
const path = require('path')
const fs = require('fs')

const features = glob.sync(path.resolve(process.cwd(), './src/_features/**/index.js')).map(file => {
  const name = path.basename(path.dirname(file))
  return `/*
  DO NOT EDIT, PRECOMPILED DURING BUILD FROM LIST OF ALL DIRECTORIES IN _features
*/
import 'Features/${name}/index.js'
`
})

const markup = features.join('\n')

fs.writeFileSync(path.resolve(process.cwd(), './src/scripts/features.js'), markup, 'utf8')
