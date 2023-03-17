const path = require('path')

process.build = process.build || {}
process.build.themeRoot = path.resolve(process.cwd(), 'src')
process.build.outputPath = path.resolve(process.cwd(), 'dist')
