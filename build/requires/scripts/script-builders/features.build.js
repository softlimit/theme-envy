const path = require('path')
const fs = require('fs')
const { getAll } = require('#Build/functions')

const features = getAll('features').map(file => {
  const name = path.basename(path.dirname(file))
  return `import 'Features/${name}/index.js'`
})

const markup = features.join('\n')

fs.writeFileSync(path.resolve(__dirname, '../features.js'), markup, 'utf8')
