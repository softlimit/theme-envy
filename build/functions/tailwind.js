/**
 * @private
 * @file Runs Tailwind using the Tailwind CLI during build
 * @see https://tailwindcss.com/docs/installation#using-tailwind-cli
*/
const { spawn } = require('child_process')
const path = require('path')

module.exports = function({ mode, opts }) {
  return new Promise((resolve, reject) => {
    const watch = opts.watch || false
    const verbose = opts.verbose || false

    // run tailwind
    const tailwindCss = path.resolve(__dirname, '../requires/styles/theme-envy.css')
    const tailwindOpts = ['tailwindcss', 'build', '-i', tailwindCss, '-o', `${ThemeEnvy.outputPath}/assets/theme-envy.critical.css`]
    if (mode === 'production') tailwindOpts.push('--minify')
    if (watch) tailwindOpts.push('--watch')
    const tailwindOutput = verbose ? { stdio: 'inherit' } : {}
    const tailwindProcess = spawn('npx', tailwindOpts, tailwindOutput)
    if (watch) {
      // watch process does not exit, so we need to increment the progress bar and resolve the promise
      ThemeEnvy.progress.increment('tailwind')
      resolve()
    }
    tailwindProcess.on('exit', () => {
      ThemeEnvy.progress.increment('tailwind')
      resolve()
    })
  })
}
