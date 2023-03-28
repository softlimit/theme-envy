const path = require('path')

module.exports = (filePath) => {
  const file = {
    name: path.basename(filePath, '.liquid'),
    type: filePath.includes('sections/') ? 'section' : filePath.includes('snippets/') ? 'snippet' : filePath.includes('partials/') ? 'partial' : filePath.includes('layout/') ? 'layout' : filePath.includes('templates/') ? 'template' : filePath.includes('assets/') ? 'asset' : null,
    path: path.resolve(filePath),
    tree: {}
  }
  return file
}
