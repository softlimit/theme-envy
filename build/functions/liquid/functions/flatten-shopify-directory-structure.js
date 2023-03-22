/**
  * @private
  * @file Helper function to determine correct output path for input file
  * @param {string} path - path to file
  * @returns {string} - output path
  */

module.exports = function(path) {
  const filename = path.slice(path.lastIndexOf('/') + 1)
  if (path.includes('snippets/')) {
    return `snippets/${filename}`
  }
  if (path.includes('sections/')) {
    return `sections/${filename}`
  }
  if (path.includes('layout/')) {
    return `layout/${filename}`
  }
  if (path.includes('templates/customers')) {
    return `templates/customers/${filename}`
  }
  if (path.includes('templates/') && !path.includes('customers/')) {
    return `templates/${filename}`
  }
  if (path.includes('assets/')) {
    return `assets/${filename}`
  }
  return false
}
