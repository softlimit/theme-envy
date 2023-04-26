module.exports = {
  distClean: require('./functions/dist-clean.js'),
  ensureDirectories: require('./functions/ensure-directories.js'),
  findOrphans: require('./functions/find-orphans.js'),
  globalThemeEnvy: require('./functions/global-theme-envy.js'),
  liquidPrettify: require('./functions/liquid-prettify.js'),
  liquidTree: require('./functions/liquid-tree'),
  parseSchema: require('./functions/parse-schema.js'),
  pullJson: require('./functions/pull-json.js'),
  scaffoldNew: require('./functions/scaffold-new'),
}
