/**
 * @private
 * @file a schema partial that can be re-used in multiple schema files ThemeRequire('schema-example-feature-schema-partial.js')
 */
module.exports = [
  {
    type: 'Header',
    content: 'Example Setting'
  },
  {
    type: 'text',
    id: 'title',
    label: 'Title',
    default: 'Title'
  }
]
