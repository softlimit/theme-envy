const path = require('path')
const fs = require('fs-extra')
const { getAll } = require('#Build/functions')

const features = getAll('features').map(file => {
  return `import '${file}'`
})

const markup = features.join('\n')

fs.writeFileSync(path.resolve(__dirname, '../features.js'), markup, 'utf8')
