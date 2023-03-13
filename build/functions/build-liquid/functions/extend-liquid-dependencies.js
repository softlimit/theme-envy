/*
  * Helper function that returns a list of files that reference the given file
  * @param {string} filePath - path to file to find dependencies for
  * @param {string} source - source code of file to find dependencies for
  * @returns {array} - list of files that reference the given file
*/
const path = require('path')
const fs = require('fs')
const getAll = require('#Build/functions/get-all.js')
// pre glob all liquid partials
const globbedPartials = getAll('partials')

const listDependencies = ({ filePath, source }) => {
  const dependencies = []
  const tags = /{%[-]?\s*((partial|hook|theme)\s['|"](\S*)['|"])\s*[-]?%}/gm
  const inLiquid = /(?<!{%[-]?\s)((partial|hook)\s['|"](.*)['|"])/gm
  const foundTags = [...source.matchAll(tags), ...source.matchAll(inLiquid)]
  foundTags.forEach(tag => {
    const action = tag[2]
    const name = tag[3]
    if (action === 'partial') {
      const file = globbedPartials.filter(partial => partial.includes(`/${`${name}.liquid`}`))
      if (file.length === 0) {
        console.log(`Partial ${name} not found`)
        process.exit()
      }
      if (file[0] === filePath) return
      if (dependencies.indexOf(file[0]) === -1) dependencies.push(file[0])
    }
    if (action === 'hook') {
      if (filePath && dependencies.indexOf(filePath) === -1) dependencies.push(filePath)
    }
  })
  dependencies.forEach(file => {
    if (file === filePath) return
    const fileSource = fs.readFileSync(file, 'utf8')
    dependencies.concat(listDependencies({ source: fileSource, filePath: file }))
  })
  const resolvedPaths = dependencies.map(file => path.resolve(file))
  return resolvedPaths
}

module.exports = listDependencies
