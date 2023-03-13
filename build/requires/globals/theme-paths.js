const path = require('path')

process.build = process.build || {}
process.build.themeRoot = path.resolve(process.cwd(), 'src')
