const cliProgress = require('cli-progress')
process.build = process.build || {}
const container = new cliProgress.MultiBar({
  clearOnComplete: false,
  hideCursor: true,
  format: ' {bar} {percentage}%',
}, cliProgress.Presets.shades_classic)

process.build.progress = {
  container,
  bar: container.create(1, 0),
  total: 0,
  addToTotal: (amount) => {
    process.build.progress.total += (amount || 1)
    if (process.build.progress.bar.isActive) process.build.progress.bar.setTotal(process.build.progress.total)
  }
}
process.build.progress.addToTotal(12)
process.build.progress.bar.start(process.build.progress.total, 0)
