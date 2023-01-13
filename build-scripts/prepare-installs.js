module.exports = function(INSTALLS) {
  process.BUILD.installs = INSTALLS.map(file => {
    const extension = file.split('.').pop()
    if (extension === 'json') console.log('Theme is still using install.json files instead of install.js. Try running \'node node_modules/@softlimit/theme-envy/build-scripts/convert-json-js\' to resolve.')
    return require(file)
  }).flat()
  const hooks = process.BUILD.installs.filter(entry => entry.hook)
  const schema = process.BUILD.installs.filter(entry => !entry.hook)

  process.BUILD.hooks = {}
  process.BUILD.schema = {}
  // group all hooks together by target file and hook
  // This is so we can install hooks once per destination file...
  hooks.forEach(entry => {
    process.BUILD.hooks[entry.hook] = process.BUILD.hooks[entry.hook] || []
    // add the hook to the destination, process entry.content for softlimit partials
    // priority 0-100, default 50
    process.BUILD.hooks[entry.hook].push({ content: entry.content, priority: entry.priority || 50 })
  })
  // sort hook content by priority and concat into a single string
  Object.keys(process.BUILD.hooks).forEach(hook => {
    process.BUILD.hooks[hook] = process.BUILD.hooks[hook].sort((a, b) => a.priority - b.priority).map(entry => entry.content).join('\n')
  })

  schema.forEach(entry => {
    const file = `${entry.file}.liquid`
    process.BUILD.schema[file] = process.BUILD.schema[file] || {
      settings: [],
      blocks: [],
    }
    // add the schema to the destination, process entry.content for softlimit partials
    // target is either 'settings' or 'blocks'
    const target = entry.target.split('.')[1]
    process.BUILD.schema[file][target].push(entry.content)
  })
}
