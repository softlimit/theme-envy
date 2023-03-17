/*
  * spawns a child process to run tailwind during build
*/
const { spawn } = require('child_process')
const path = require('path')

module.exports = function({ mode, opts }) {
  const watch = opts.watch || false
  const verbose = opts.verbose || false

  // run tailwind
  const tailwindCss = path.resolve(__dirname, '../build/styles/theme-envy.css')
  const tailwindOpts = ['tailwindcss', 'build', '-i', tailwindCss, '-o', `${process.build.outputPath}/assets/theme-envy.css`]
  if (mode === 'production') tailwindOpts.push('--minify')
  if (watch) tailwindOpts.push('--watch')
  const tailwindOutput = verbose ? { stdio: 'inherit' } : {}
  spawn('npx', tailwindOpts, tailwindOutput)
  process.build.progress.bar.increment()
}
