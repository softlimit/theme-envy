/*
  npx theme-envy convert --(source|src|S)=path/to/theme

  converts a Shopify theme to Theme Envy directory structure
    - should be run after theme-envy-import, by using the --convert flag
    - can be run independently, node bin/theme-envy convert --source=path/to/theme, or --src=path/to/theme, or -S=path/to/theme
*/
const path = require('path')
const fs = require('fs-extra')
const glob = require('glob')
const { ESLint } = require('eslint')
const { directories, ensureDirectories } = require(path.resolve(__dirname, '../build-scripts/helpers/ensure-directories'))

async function lint(file) {
  const eslint = new ESLint({ fix: true })

  // Lint files.
  const results = await eslint.lintFiles([file])
  await ESLint.outputFixes(results)
}

module.exports = async function(args, opts = { argv: {} }) {
  let { source, src, S } = opts.argv
  source = source || src || S

  if (!source) {
    console.error('Source theme directory not supplied. Use --source=path/to/theme')
    process.exit(1)
  }
  const sourceTheme = path.resolve(process.cwd(), source)
  // verify source theme exists
  if (!fs.existsSync(sourceTheme)) {
    console.error(`Source theme directory not found: ${sourceTheme}`)
    process.exit(1)
  }

  // validate directory structure of source theme
  directories.forEach(dir => {
    if (!fs.existsSync(path.resolve(sourceTheme, dir))) {
      console.error(`Source theme required directory not found: ${path.resolve(sourceTheme, dir)}`)
      process.exit(1)
    }
  })

  // Create directories _features and _elements
  ensureDirectories({ root: sourceTheme, envy: true })

  // Set config/settings_schema to .js if settings_schema is json
  const settingsSchema = path.resolve(sourceTheme, 'config/settings_schema.json')
  if (fs.existsSync(settingsSchema)) {
    // rename settings_schema.json to settings_schema.js
    fs.writeFileSync(path.resolve(sourceTheme, 'config/settings_schema.json'), `module.exports = ${JSON.stringify(require(settingsSchema), null, 2)}`)
    fs.renameSync(settingsSchema, path.resolve(sourceTheme, 'config/settings_schema.js'))
    await lint(path.resolve(sourceTheme, 'config/settings_schema.js'))
  }

  // figure out if we can separate any sections into _features
  const sections = glob.sync(path.resolve(sourceTheme, 'sections/*.liquid'))

  const children = sections.map(section => {
    // regexp matching for render and include tags
    let results = detectChildren({ section, filePath: section, root: sourceTheme })
    if (results.snippets.length) {
      results.snippets.forEach(snippet => {
        const snippetPath = path.resolve(sourceTheme, `snippets/${snippet}.liquid`)
        const snippetChildren = detectChildren({ section, filePath: snippetPath })
        const snippets = [...results.snippets, ...snippetChildren.snippets]
        const assets = [...results.assets, ...snippetChildren.assets]
        results = { section, snippets: [...new Set(snippets)], assets: [...new Set(assets)] }
      })
    }
    return results
  })
  // determine if any sections have any snippets or any assets that are unique to that section
  const sectionsWithUniqueChildren = children.map(child => {
    const snippets = child.snippets.filter(snippet => {
      return !children.find(section => section.section !== child.section && section.snippets.includes(snippet))
    })
    const assets = child.assets.filter(asset => {
      return !children.find(section => section.section !== child.section && section.assets.includes(asset))
    })
    return { section: child.section, snippets, assets }
  }).filter(section => section.snippets.length || section.assets.length)

  // move sections with unique children to _features
  sectionsWithUniqueChildren.forEach(section => {
    const sectionName = path.basename(section.section, '.liquid')
    fs.ensureDirSync(path.resolve(sourceTheme, '_features', sectionName))
    fs.moveSync(section.section, path.resolve(sourceTheme, '_features', sectionName, `sections/${sectionName}.liquid`))
    if (section.snippets.length) {
      fs.ensureDirSync(path.resolve(sourceTheme, '_features', sectionName, 'snippets'))
      section.snippets.forEach(snippet => {
        fs.moveSync(path.resolve(sourceTheme, `snippets/${snippet}.liquid`), path.resolve(sourceTheme, '_features', sectionName, 'snippets', `${snippet}.liquid`))
      })
    }
    if (section.assets.length) {
      fs.ensureDirSync(path.resolve(sourceTheme, '_features', sectionName, 'assets'))
      section.assets.forEach(asset => {
        fs.moveSync(path.resolve(sourceTheme, `assets/${asset}`), path.resolve(sourceTheme, '_features', sectionName, 'assets', `${asset}`))
      })
    }
  })
}

function detectChildren({ section, filePath, root }) {
  try {
    const source = fs.readFileSync(filePath, 'utf8')
    const snippetTags = /\s*((include|render)\s['|"](\S*)['|"])\s*/gm
    const snippets = [...source.matchAll(snippetTags)].map(tag => tag[3]).filter(snippet => {
      // file exists
      return fs.existsSync(path.resolve(process.cwd(), root, `snippets/${snippet}.liquid`))
    })
    const assetUrl = /['|"](\S*)['|"]\s*[|]\s*asset_url/gm
    const assets = [...source.matchAll(assetUrl)].map(tag => tag[1]).filter(asset => {
      // file exists
      return fs.existsSync(path.resolve(process.cwd(), root, `assets/${asset}`))
    })
    // return unique values
    return {
      section,
      snippets: [...new Set(snippets)],
      assets: [...new Set(assets)]
    }
  } catch (e) {
    return {
      section,
      snippets: [],
      assets: []
    }
  }
}
