const countResults = (obj) => {
  // deep count number of entries in results object
  let count = 0
  Object.keys(obj).forEach(key => {
    if (obj[key].tree) {
      count += countResults(obj[key].tree)
    }
    count++
  })
  return count
}

module.exports = countResults
