/**
  * @private
  * @file Collect all the install.js files that insert code into the theme hooks
  * @description
  * Find all files in the src directory that end with install.js
  * These files should export an array of objects with the following properties:
  *  hook: the name of the hook to insert the code into
  *  content: the code to insert
  *  priority: the priority of the code, 0-100, default 50
  *
    module.exports = [
      {
        hook: 'head-start',
        content: '{% partial "_test-partial" %}',
        priority: 50
      }
    ]
  */
const { getAll } = require('#Build/functions')
const path = require('path');
(() => {
  const installs = getAll('installs')
  // collect all installs
  ThemeEnvy.installs = installs.map(file => require(path.resolve(file))).flat()

  const hooks = ThemeEnvy.installs.filter(entry => entry.hook)
  const schema = ThemeEnvy.installs.filter(entry => !entry.hook)

  ThemeEnvy.hooks = {}
  ThemeEnvy.schema = {}
  // group all hooks together by target file and hook
  // This is so we can install hooks once per destination file...
  hooks.forEach(entry => {
    ThemeEnvy.hooks[entry.hook] = ThemeEnvy.hooks[entry.hook] || []
    // add the hook to the destination, process entry.content for softlimit partials
    // priority 0-100, default 50
    ThemeEnvy.hooks[entry.hook].push({ content: entry.content, priority: entry.priority || 50 })
  })
  // sort hook content by priority and concat into a single string
  Object.keys(ThemeEnvy.hooks).forEach(hook => {
    ThemeEnvy.hooks[hook] = {
      content: ThemeEnvy.hooks[hook].sort((a, b) => a.priority - b.priority).map(entry => entry.content).join('\n')
    }
  })

  // TODO: LOOK INTO THIS
  schema.forEach(entry => {
    const file = `${entry.file}.liquid`
    ThemeEnvy.schema[file] = ThemeEnvy.schema[file] || {
      settings: [],
      blocks: [],
    }
    // add the schema to the destination, process entry.content for softlimit partials
    // target is either 'settings' or 'blocks'
    const target = entry.target.split('.')[1]
    ThemeEnvy.schema[file][target].push(entry.content)
  })
})()
