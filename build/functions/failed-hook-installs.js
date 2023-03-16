const chalk = require('chalk')
const logSymbols = require('#LogSymbols')

module.exports = function() {
  const unusedHookInstalls = Object.keys(process.build.hooks).filter(hook => !process.build.hooks[hook].replaced)
  if (!unusedHookInstalls || unusedHookInstalls.length === 0) return
  console.error(`
${logSymbols.error} ${chalk.red.bold('Error:')}
The following hook injections failed because there is no corresponding hook tag in the theme:
${chalk.red(unusedHookInstalls.join('\n'))}
`)
  process.exit()
}
