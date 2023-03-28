/**
 * @file This file contains the logic for collecting all of the dependencies for a given file.
 */

const fs = require('fs')
const glob = require('glob')
const path = require('path')
const { getFileInfo } = require('../functions')

// Collect all of our liquid files
const liquidFiles = glob.sync(path.resolve(ThemeEnvy.themePath, '**/*.liquid'))
// define our strings that we want to find in the files
const searchStrings = (file) => {
  return {
    asset: [`'${file.name}' | asset_url`, `"${file.name}" | asset_url`],
    snippet: [`render '${file.name}'`, `render "${file.name}"`, `include '${file.name}'`, `include "${file.name}"`],
    partial: [`partial '${file.name}'`, `partial "${file.name}"`],
    section: [`section '${file.name}'`, `section "${file.name}"`],
  }
}

module.exports = {
  check(filePath) {
    this.results = {}
    const fileName = filePath.includes('.') ? filePath : path.basename(filePath, '.liquid')
    this.results[fileName] = getFileInfo(filePath)
    this.results = this.collect(this.results)

    // remove all searchString attributes and empty trees from our results
    this.results = this.cleanForReport(this.results)
    return this.results
  },
  collect(results) {
    // iterate through each file in our results object
    Object.entries(results).forEach(file => {
      const fileInfo = file[1]
      // get the tree for the file
      fileInfo.tree = this.getFileTree(fileInfo)
    })
    return results
  },
  getFileTree(fileInfo) {
    // do not check "templates", or "layouts" for dependencies
    if (['template', 'layout'].includes(fileInfo.type)) return fileInfo.tree
    const tree = {}
    this.numberOfFiles = this.numberOfFiles > 0 ? this.numberOfFiles : 0
    // check all liquid files for references to the file
    liquidFiles.filter(file => file !== fileInfo.path).forEach(liquid => {
      const source = fs.readFileSync(path.resolve(process.cwd(), liquid), 'utf8')
      searchStrings(fileInfo)[fileInfo.type].forEach(string => {
        if (source.includes(string)) {
          // add the partial to our results object and continue down its tree
          const fileName = path.basename(liquid, '.liquid')
          tree[fileName] = getFileInfo(liquid)
          tree[fileName].tree = this.getFileTree(tree[fileName])
        }
      })
    })
    return tree
  },
  cleanForReport(results) {
    // remove any empty trees from our results for a cleaner report
    Object.entries(results).forEach(file => {
      const fileInfo = file[1]
      delete fileInfo.name
      if (Object.keys(fileInfo.tree).length === 0) delete fileInfo.tree
    })
    // clean the sub trees
    Object.entries(results).forEach(file => {
      if (file[1].tree) file[1].tree = this.cleanForReport(file[1].tree)
    })
    return results
  }
}
