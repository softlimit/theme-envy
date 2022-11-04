const fs = require('fs')
const { ESLint } = require('eslint')
const { Liquid } = require('liquidjs')
const engine = new Liquid({})
const BuildTime = require('./build-time')

function renderTemplate({ data, templatePath, destination }) {
  const timer = new BuildTime()
  const template = fs.readFileSync(templatePath, 'utf8')
  engine
    .parseAndRender(template, data)
    .then(string => {
      try {
        fs.writeFileSync(destination, string)
        lint(destination)
      } catch (error) {
        throw new Error(error)
      }
    })
  timer.report()
}

async function lint(file) {
  const eslint = new ESLint({ fix: true })

  // Lint files.
  const results = await eslint.lintFiles([file])
  await ESLint.outputFixes(results)
}
module.exports = { renderTemplate }
