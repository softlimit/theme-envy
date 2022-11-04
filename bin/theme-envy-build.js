const chalk = require('chalk')
const path = require('path')
const config = require(path.resolve(__dirname, '.././webpack.config.js'))
const webpack = require('webpack')
const EventEmitter = require('events')
const BuildTime = require('../utils/build-time')

process.BUILD = process.BUILD || {}

process.BUILD.events = process.BUILD.events || new EventEmitter()
let remoteWatchStarted = false
let buildCount = 0

module.exports = function([mode] = ['production'], opts = { watch: false }) {
  const timer = new BuildTime()
  console.log(`Building ${mode} theme...`)
  const options = config({ ENV: mode })
  process.env.mode = mode
  options.watch = opts.watch
  const dots = setInterval(() => console.log('...'), 2000)
  process.BUILD.building = true
  const compiler = webpack(options, (err, stats) => {
    // [Stats Object](#stats-object)
    if (err) console.log(err)
    if (stats?.hasErrors()) console.log(stats)
    // [Handle errors here](#error-handling)
    clearInterval(dots)
    buildCount++
    timer.report()
    // display times of utils/long processes
    const longTimes = longProcesses(process.BUILD.timing)
    if (Object.keys(longTimes).length > 0) {
      const formatTimeDisplay = Object.keys(orderKeys(longTimes)).map(key => `\n  ${key}: ${longTimes[key]}ms`).join('')
      console.log('===============================')
      console.log('LONG SCRIPT TIMES:', formatTimeDisplay)
      console.log('===============================')
    }

    process.BUILD.events.emit('build:complete')
    process.BUILD.building = false
  })
  // output list of changed files
  compiler.hooks.watchRun.tap('WatchRun', (compiler) => {
    if (compiler.modifiedFiles?.size > 0) {
      const changedFiles = Array.from(compiler.modifiedFiles, (file) => `\n  ${file.slice(file.lastIndexOf('src/') + 4)}`).filter(file => file.indexOf('.') > -1)
      if (changedFiles.length > 0) {
        console.log('===============================')
        console.log('FILES CHANGED:', changedFiles.join(''))
        console.log('===============================')
      }
    }
  })
}

function log(color, msg, ...more) {
  const border = new Array(msg.length + 1).join('=')
  console.log(' ' + chalk[color](border), '\n', chalk[color](msg), '\n', ...more, '\n', chalk[color](border))
}

function orderKeys(obj) {
  return Object.keys(obj).sort().reduce((acc, key) => {
    acc[key] = obj[key]
    return acc
  }, {})
}

function longProcesses(obj) {
  return Object.keys(obj).reduce((acc, key) => {
    if (obj[key] > 250) {
      acc[key] = obj[key]
    }
    return acc
  }, {})
}
