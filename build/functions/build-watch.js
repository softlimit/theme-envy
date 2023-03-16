const chokidar = require('chokidar')

module.exports = function({ build, mode }) {
  console.log('watching for changes...')
  chokidar.watch(process.build.themeRoot).on('change', (path) => {
    process.build.events.emit('watch:start')
    const isJSONTemplate = path.includes('templates/') && path.extname(path) === '.json'
    if (!isJSONTemplate) {
      build({ files: [path], mode })
      console.log(`updated: ${path.split('/src/')[1]}`)
    }
  })
}
