/**
 * @file Builds our elements.js file based on the elements in our src/elements directory
 * @description Lazy loads our elements based on their presence in the DOM and the loading attribute
 */

const path = require('path')
const fs = require('fs-extra')
const { getAll } = require('#Build/functions')
const elements = getAll('elements').map(file => {
  const name = path.basename(file) === 'index.js' ? path.basename(path.dirname(file)) : path.basename(file, '.js')
  return `'${name}': () => import(/* webpackChunkName: "${name}" */ '${file}')`
})

const markup = elements.length
  ? `const elements = {
  ${elements.join(',\n  ')}}
// check all elements for presence in the Document and load if they are there
function dynamicElements() {
  Object.entries(elements).forEach(elm => {
    const domElm = document.querySelector(elm[0])
    if (domElm) {
      if (domElm.getAttribute('loading') === 'lazy') {
        const observer = new IntersectionObserver((entries, observer) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              loadElement(elm)
              domElm.setAttribute('loading', 'loaded')
              observer.disconnect()
            }
          })
        }, { rootMargin: '0px 0px 500px 0px', threshold: 0 })
        observer.observe(domElm)
        return
      }
      loadElement(elm)
    }
  })
}
dynamicElements()
function loadElement(elm) {
  // load the element
  elm[1]()
  // remove from Object so we don't need to check again
  delete elements[elm[0]]
}
// eslint-disable-next-line no-undef
if (Shopify.designMode) {
  document.addEventListener('shopify:section:load', dynamicElements)
}
`
  : ''
fs.writeFileSync(path.resolve(__dirname, '../elements.js'), markup, 'utf8')
