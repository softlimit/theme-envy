const getDepth = (obj, depth = 0, arr = []) => {
  // collect object depth and key for each entry into an array so we can output a smaller, less verbose version of the tree
  Object.keys(obj).forEach(key => {
    arr.push({ depth, key, type: obj[key].type })
    if (obj[key].tree) {
      getDepth(obj[key].tree, depth + 1, arr)
    }
  })
  return arr
}

module.exports = getDepth
