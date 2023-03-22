/**
 * @file Used as a template for a new script file for a new feature or element
 * @param {string} elementName - The name of the feature or element
 * @param {string} elementClass - The class name of the feature or element
 */

module.exports = (elementName, elementClass) => {
  return `class ${elementClass} extends HTMLElement {
  constructor() {
    super()
    console.log(this)
  }
}
customElements.define('${elementName}', ${elementClass})
`
}
