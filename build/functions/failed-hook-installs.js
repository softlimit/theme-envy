const chalk = require('chalk')
const logSymbols = require('#LogSymbols')

module.exports = function() {
  const unusedHookInstalls = []
  Object.keys(process.build.hooks).forEach(hook => {
    if (!process.build.hooks[hook].replaced) {
      unusedHookInstalls.push(hook)
    }
  })
  if (unusedHookInstalls.length === 0) return
  console.error(`
${logSymbols.error} ${chalk.red.bold('Error:')}
The following hook injections failed because there is no corresponding hook tag in the theme:
${chalk.red(unusedHookInstalls.join('\n'))}
`)
  process.exit()
}
