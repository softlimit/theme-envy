const { getAll } = require('#Build/functions')
const cliProgress = require('cli-progress')
const colors = require('ansi-colors');

(() => {
  const counts = {
    assets: getAll('assets').length,
    config: 1,
    failedHookInstalls: 1,
    globals: 1,
    liquid: getAll('liquid').length,
    locales: 1,
    requires: 6,
    sectionGroups: 1,
    tailwind: 1,
    templates: getAll('templates').length,
    webpack: 1,
  }
  const bar = new cliProgress.SingleBar({
    format: colors.cyan('{bar}') + ' {percentage}% | {duration_formatted}',
    barCompleteChar: '\u2588',
    barIncompleteChar: '\u2591',
    hideCursor: true,
  }, cliProgress.Presets.shades_classic)

  ThemeEnvy.progress = {
    bar,
    increment(label, step) {
      /* label: string - the label of the progress bar to increment
        * step: number - the number of steps to increment the progress bar by if different than the entry in counts
      */
      step = step || (counts[label] ? counts[label] : 1)
      bar.increment(step)
    }
  }

  const totalBuildSteps = Object.values(counts).reduce((a, b) => a + b, 0)

  bar.start(totalBuildSteps, 0)

  ThemeEnvy.events.on('build:complete', () => {
    bar.stop()
  })
})()
