const { spawn } = require('child_process')
const path = require('path')
const dist = path.resolve(process.cwd(), ThemeEnvy.outputPath)

module.exports = async (newThemeID) => {
  return new Promise((resolve, reject) => {
    try {
      // shopify push
      const push = spawn('shopify', ['theme', 'push', '--theme=' + newThemeID, '--ignore=*.json', '--path=' + dist])
      push.stdout.setEncoding('utf8')
      push.stdout.on('data', data => {
        console.log(data)
      })
      push.on('close', () => {
        resolve(newThemeID)
      })
      const handleError = (error) => {
        reject(error)
        console.error(error.message)
        throw new Error('Could not push theme')
      }
      push.stderr.on('data', handleError)
      push.on('error', handleError)
      return newThemeID
    } catch (error) {
      console.log(error)
      reject(error)
      // exit the process
      process.exit()
    }
  })
}
