/**
 * @private
 * @file Manages our progress bar during the build process
 */
const { getAll } = require('#Build/functions')
const cliProgress = require('cli-progress')
const colors = require('ansi-colors');

(() => {
  // setup all of our progress bar steps
  // these are then used to increment the progress bar
  // ThemeEnvy.progress.increment('label', step)
  const counts = {
    assets: getAll('assets').length,
    config: 1,
    failedHookInstalls: 1,
    globals: 1,
    liquid: getAll('liquid').length,
    locales: 1,
    requires: 7,
    sectionGroups: 1,
    tailwind: ThemeEnvy?.tailwind !== false ? 1 : 0,
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
      /**
        * @param {string} label - the label of the progress bar to increment
        * @param {number} step - the number of steps to increment the progress bar by if different than the entry in counts
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
