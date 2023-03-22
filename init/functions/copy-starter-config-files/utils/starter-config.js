/**
 * @file Used as a template for a new config file for a new feature or element
 * @param {string} readableName - The name of the feature or element
 */

module.exports = (readableName) => {
  return `module.exports = [
    {
      name: '${readableName}',
      settings: [
  
      ]
    }
  ]
  
`
}
