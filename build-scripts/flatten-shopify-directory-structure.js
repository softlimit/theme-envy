const BuildTime = require('./build-time')
const cache = {}
function flattenShopifyDirectoryStructure(path) {
  const timer = new BuildTime()
  if (cache[path]) {
    timer.report()
    return cache[path]
  }

  const flattenedPath = path
  const filename = path.slice(path.lastIndexOf('/') + 1)

  if (path.includes('snippets/')) {
    cache[path] = `snippets/${filename}`
  }
  if (path.includes('sections/')) {
    cache[path] = `sections/${filename}`
  }
  if (path.includes('layout/')) {
    cache[path] = `layout/${filename}`
  }
  if (path.includes('templates/customers')) {
    cache[path] = `templates/customers/${filename}`
  }
  if (path.includes('templates/') && !path.includes('customers/')) {
    cache[path] = `templates/${filename}`
  }
  if (path.includes('assets/')) {
    cache[path] = `assets/${filename}`
  }
  if (!cache[path]) cache[path] = flattenedPath

  timer.report()
  return cache[path]
}

module.exports = flattenShopifyDirectoryStructure
