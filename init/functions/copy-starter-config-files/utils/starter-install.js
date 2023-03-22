/**
 * @file Used as a template for a new install.js file for a new feature or element
 * @param {string} elementName - The name of the feature or element
 */

module.exports = (elementName) => {
  return `module.exports = [
  {
    hook: 'body-end',
    content: "{% render '${elementName}' %}"
  }
]
`
}
