/*
  DO NOT EDIT, PRECOMPILED DURING BUILD FROM LIST OF ALL DIRECTORIES IN _elements
*/
const glob = require('glob')
const path = require('path')
const fs = require('fs')

const elements = glob.sync(path.resolve(process.cwd(), './src/_elements/**/index.js')).map(file => {
  const name = path.basename(path.dirname(file))
  return `'${name}': () => import(/* webpackChunkName: "${name}" */ 'Elements/${name}/index.js')`
})

const markup = `/*
DO NOT EDIT, PRECOMPILED DURING BUILD FROM LIST OF ALL DIRECTORIES IN _elements
*/
const elements = {${elements.join(',\n')}}
// check all elements for presence in the Document and load if they are there
Object.entries(elements).forEach(elm => {
  if (document.querySelector(elm[0])) {
    // load the element
    elm[1]()
    // remove from Object so we don't need to check again
    delete elements[elm[0]]
  }
})
`
fs.writeFileSync(path.resolve(__dirname, './elements.js'), markup, 'utf8')
