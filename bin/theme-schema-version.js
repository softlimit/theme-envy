const stringifyPackage = require('stringify-package')
const detectIndent = require('detect-indent')
const detectNewline = require('detect-newline')

module.exports.readVersion = (contents) => {
  return JSON.parse(contents)[0].theme_version
}

module.exports.writeVersion = (contents, version) => {
  const json = JSON.parse(contents)
  const indent = detectIndent(contents).indent
  const newline = detectNewline(contents)
  json[0].theme_version = version
  return stringifyPackage(json, indent, newline)
}
