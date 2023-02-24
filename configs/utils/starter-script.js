module.exports = (elName, elClass) => {
  return `class ${elClass} extends HTMLElement {
  constructor () {
    super()
    console.log(this)
  }
}
customElements.define('${elName}', ${elClass})
`
}
