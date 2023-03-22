/**
 * @file Used as a template for a new schema file for a new feature section
 * @param {string} elementName - The name of the feature or element
 * @param {string} readableName - The readable name of the feature or element
 */

module.exports = (elementName, readableName) => {
  return `module.exports = {
  name: '${readableName}',
  tag: 'section',
  class: '${elementName}',
  settings: [
    ...ThemeRequire('schema-colors'),
    ...ThemeRequire('schema-full-width'),
    {
      type: 'header',
      content: 'Section Vertical Spacing'
    },
    ...ThemeRequire('schema-spacing-y'),
    ...ThemeRequire('schema-lazy'),
    ...ThemeRequire('schema-custom-classes'),
  ],
  presets: [
    {
      name: '${readableName}',
      category: 'General',
      settings: {},
    },
  ],
}
`
}
