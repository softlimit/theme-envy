/*
  * Before a build starts, we need to collect all the installs that insert code into the theme hooks
  * This is done by looking for all files in the src directory that end with install.js
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
  process.build.installs = installs.map(file => require(path.resolve(file))).flat()

  const hooks = process.build.installs.filter(entry => entry.hook)
  const schema = process.build.installs.filter(entry => !entry.hook)

  process.build.hooks = {}
  process.build.schema = {}
  // group all hooks together by target file and hook
  // This is so we can install hooks once per destination file...
  hooks.forEach(entry => {
    process.build.hooks[entry.hook] = process.build.hooks[entry.hook] || []
    // add the hook to the destination, process entry.content for softlimit partials
    // priority 0-100, default 50
    process.build.hooks[entry.hook].push({ content: entry.content, priority: entry.priority || 50 })
  })
  // sort hook content by priority and concat into a single string
  Object.keys(process.build.hooks).forEach(hook => {
    process.build.hooks[hook] = {
      content: process.build.hooks[hook].sort((a, b) => a.priority - b.priority).map(entry => entry.content).join('\n')
    }
  })

  // TODO: LOOK INTO THIS
  schema.forEach(entry => {
    const file = `${entry.file}.liquid`
    process.build.schema[file] = process.build.schema[file] || {
      settings: [],
      blocks: [],
    }
    // add the schema to the destination, process entry.content for softlimit partials
    // target is either 'settings' or 'blocks'
    const target = entry.target.split('.')[1]
    process.build.schema[file][target].push(entry.content)
  })
})()
