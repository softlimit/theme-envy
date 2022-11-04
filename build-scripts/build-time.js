const caller = require('caller')
const path = require('path')
const EventEmitter = require('events')

process.BUILD = process.BUILD || {}
process.BUILD.timing = {}
process.BUILD.events = process.BUILD.events || new EventEmitter()

process.BUILD.events.on('build:complete', () => {
  process.BUILD.timing = {}
})

class BuildTime {
  constructor() {
    this.label = path.basename(caller())
    this.startTime = Date.now()
    process.BUILD.timing[this.label] = process.BUILD.timing[this.label] || 0
  }

  report() {
    const time = Date.now() - this.startTime
    process.BUILD.timing[this.label] += time
  }
}
module.exports = BuildTime
