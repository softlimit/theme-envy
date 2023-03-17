const path = require('path')
const fs = require('fs-extra')
const { getAll } = require('#Build/functions')
// copy all templates to dist
const globbedTemplates = getAll('templates')

const templateOutputPath = path.resolve(process.build.outputPath, 'templates')
// if dist/templates doesn't exist, create it
fs.ensureDirSync(templateOutputPath)
globbedTemplates.forEach(file => {
  // write each file to dist
  fs.copyFileSync(file, path.resolve(templateOutputPath, path.basename(file)))
  // update progress bar
  process.build.progress.bar.increment()
})
