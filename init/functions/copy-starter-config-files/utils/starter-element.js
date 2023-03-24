/**
 * @file Used as a template for a new script file for a new element
 * @param {string} elementName - The name of the element
 * @param {string} elementClass - The class name of the element
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
