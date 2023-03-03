const elements = {}
// check all elements for presence in the Document and load if they are there
Object.entries(elements).forEach(elm => {
  if (document.querySelector(elm[0])) {
    // load the element
    elm[1]()
    // remove from Object so we don't need to check again
    delete elements[elm[0]]
  }
})
