/**
 * @private
 * @file The schema for the example feature, included in example-feature-section.liquid {% schema 'schema-example-feature-section' %}
 */
module.exports = {
  name: 'Example Feature',
  tag: 'div',
  settings: [
    ...ThemeRequire('schema-example-feature-schema-partial.js')
  ],
  presets: {
    name: 'Example Feature'
  }
}
