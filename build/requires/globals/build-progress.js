const cliProgress = require('cli-progress')
process.build = process.build || {}

process.build.progress = {
  bar: new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic),
  total: 0,
  addToTotal: (amount) => {
    process.build.progress.total += (amount || 1)
    process.build.progress.bar.setTotal(process.build.progress.total)
  }
}
process.build.progress.bar.start(12, 0)
