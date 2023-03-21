const { getAll } = require('#Build/functions')
const cliProgress = require('cli-progress')
const colors = require('ansi-colors')

ThemeEnvy.progressBar = new cliProgress.SingleBar({
  format: colors.cyan('{bar}') + ' {percentage}% | {duration_formatted}',
  barCompleteChar: '\u2588',
  barIncompleteChar: '\u2591',
  hideCursor: true,
}, cliProgress.Presets.shades_classic)

const buildProcessCounts = {
  assets: getAll('assets').length,
  config: 1,
  liquid: getAll('liquid').length,
  globals: 1,
  locales: 1,
  requires: 6,
  tailwind: 1,
  templates: getAll('templates').length,
  themeEnvy: 3,
  webpack: 1,
}
// add up all the counts
const totalBuildSteps = Object.values(buildProcessCounts).reduce((a, b) => a + b, 0)

ThemeEnvy.progressBar.start(totalBuildSteps, 0)
