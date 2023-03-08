module.exports = (elName, readName) => {
  return `module.exports = {
  name: '${readName}',
  tag: 'section',
  class: '${elName}',
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
      name: '${readName}',
      category: 'General',
      settings: {},
    },
  ],
}
`
}
