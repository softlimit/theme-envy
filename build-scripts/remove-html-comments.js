const fs = require('fs')
const path = require('path')
const BuildTime = require('./build-time')
class RemoveHTMLLiquidComments {
  apply(compiler) {
    compiler.hooks.afterEmit.tap('AfterEmitPlugin', (compilation) => {
      const timer = new BuildTime()
      const files = []
      // collect unique file names
      Object.entries(process.BUILD.hooks).forEach(entry => {
        if (files.indexOf(entry[1]) === -1) files.push(entry[1])
      })
      files.forEach(fileList => {
        fileList.forEach(file => {
          const filePath = path.resolve(`./dist/${file}`)
          if (!fs.existsSync(filePath)) {
            console.error(`File does not exist: ${filePath}`)
            throw new Error('File does not exist: ' + filePath)
          }
          let content = fs.readFileSync(filePath, 'utf8')
          // remove html comments
          content = content.replace(/<!-- HOOK.*?-->/g, '')
          // remove empty lines
          content = content.replace(/^\s*$/gm, '')
          fs.writeFileSync(filePath, content)
        })
      })
      timer.report()
    })
  }
}

module.exports = RemoveHTMLLiquidComments
