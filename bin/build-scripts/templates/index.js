const glob = require('glob')
const path = require('path')
const fs = require('fs')

// copy all templates to dist
const globbedTemplates = glob.sync(path.resolve(process.cwd(), './src/**/templates/**/*.json'))

// if dist/templates doesn't exist, create it
if (!fs.existsSync(path.resolve(process.cwd(), './dist/templates'))) {
  fs.mkdirSync(path.resolve(process.cwd(), './dist/templates'), { recursive: true })
}
globbedTemplates.forEach(file => {
  // write each file to dist
  fs.copyFileSync(file, path.resolve(process.cwd(), './dist/templates', path.basename(file)))
})
