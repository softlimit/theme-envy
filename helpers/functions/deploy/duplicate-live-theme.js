/*
  Exports function: duplicateLiveTheme
  Returns a promise that resolves to the new theme ID
*/
const { spawn } = require('child_process')
const path = require('path')
const env = require('./env.js')
process.env.SHOPIFY_CLI_THEME_TOKEN = env.password
process.env.SHOPIFY_FLAG_STORE = ThemeEnvy.store
const dist = path.resolve(process.cwd(), ThemeEnvy.outputPath)

module.exports = async ({ themeName, type = 'unpublished' }) => {
  /*
  Download live theme from shopify to dist folder
  */
  const _downloadLiveTheme = async () => {
    console.log('Downloading Live Theme')
    return new Promise((resolve, reject) => {
      try {
        const pull = spawn('shopify', ['theme', 'pull', '--live', '--path=' + dist], {
          stdio: 'inherit'
        })
        pull.on('close', resolve)

        const handleError = (error) => {
          console.log(error)
          reject(error)
        }

        pull.on('error', handleError)
      } catch (error) {
        const err = new Error('Could not download live theme')
        reject(err)
        throw err
      }
    })
  }

  // push without context templates first
  const _shopifyNewTheme = async () => {
    console.log(`Creating Theme: ${themeName}`)
    return new Promise((resolve, reject) => {
      try {
        const push = spawn('shopify', ['theme', 'push', '--ignore=templates/\*.context.\*.json', '--ignore=sections/\*.context.\*.json', `--${type}`, '--json', (type === 'unpublished' && ('--theme=' + themeName)), '--path=' + dist])
        push.stdout.setEncoding('utf8')
        push.stdout.on('data', data => {
          console.log(data)
          if (data.includes('{"theme":')) {
            // extract theme id from data
            const themeID = data.match(/"id":(\d+)/)[1]
            resolve(themeID)
          }
        })
        const handleError = (error) => {
          reject(error)
        }
        push.stderr.on('data', handleError)
        push.on('error', handleError)
      } catch {
        throw new Error('Could not create new theme')
      }
    })
  }

  // then do another push to the same theme and only push context templates
  const _pushAdditionalTemplates = async (themeId) => {
    console.log(`Updating additional templates on theme: ${themeId}`)
    return new Promise((resolve, reject) => {
      try {
        const push = spawn('shopify', ['theme', 'push', '--only=templates/\*.context.\*.json', '--only=sections/\*.context.\*.json', '--json', '--theme=' + themeId, '--path=' + dist])
        push.stdout.setEncoding('utf8')
        push.stdout.on('data', data => {
          console.log(data)
          if (data.includes('{"theme":')) {
            // extract theme id from data
            const themeID = data.match(/"id":(\d+)/)[1]
            resolve(themeID)
          }
        })
      } catch {
        throw new Error('Could not push to new theme')
      }
    })
  }

  /*
  do everything
  */
  return _downloadLiveTheme()
    .then(_shopifyNewTheme)
    .then(themeId => _pushAdditionalTemplates(themeId))
    .catch((err) => {
      console.error(err.toString())
      throw new Error('Theme download/backup failed')
    })
}
