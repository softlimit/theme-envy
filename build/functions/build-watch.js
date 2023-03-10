const chokidar = require('chokidar')
const path = require('path')

module.exports = function({ build }) {
  console.log('watching for changes...')
  chokidar.watch(path.resolve(process.cwd(), 'src')).on('change', (path) => {
    process.build.events.emit('watch:start')
    const isJSONTemplate = path.includes('templates/') && path.extname(path) === '.json'
    if (!isJSONTemplate) {
      build({ files: [path] })
      console.log(`updated: ${path.split('/src/')[1]}`)
    }
  })
}
