/*
  npx theme-envy init --target=path/to/dest

  creates skeleton structure for src folder
    - Shopify directories
    - Adds "_features" and "_elements" directories
    - config files
*/
const path = require('path')
const fs = require('fs')
const fse = require('fs-extra')
const glob = require('glob')
const { ESLint } = require('eslint')

async function lint(file) {
  const eslint = new ESLint({ fix: true })

  // Lint files.
  const results = await eslint.lintFiles([file])
  await ESLint.outputFixes(results)
}

module.exports = async function(args, opts = { target: './', feature: false }) {
  const sourceTheme = path.resolve(process.cwd(), opts.target)
  const destTheme = path.resolve(process.cwd(), 'converted-theme')

  // Create destination directory
  fse.ensureDirSync(destTheme)

  // Copy files from source to destination
  const sourceDirectores = ['assets', 'config', 'layout', 'locales', 'sections', 'snippets', 'templates']
  sourceDirectores.forEach(dir => {
    fse.copySync(path.resolve(sourceTheme, dir), path.resolve(destTheme, dir))
  })

  // Create directories _features and _elements
  fse.ensureDirSync(path.resolve(destTheme, '_features'))
  fse.ensureDirSync(path.resolve(destTheme, '_elements'))

  // Set config/settings_schema to .js
  const settingsSchema = path.resolve(destTheme, 'config/settings_schema.json')
  // rename settings_schema.json to settings_schema.js
  fs.writeFileSync(path.resolve(destTheme, 'config/settings_schema.json'), `module.exports = ${JSON.stringify(require(settingsSchema), null, 2)}`)
  fs.renameSync(settingsSchema, path.resolve(destTheme, 'config/settings_schema.js'))
  await lint(path.resolve(destTheme, 'config/settings_schema.js'))

  // figure out if we can separate any sections into _features
  const sections = glob.sync(path.resolve(destTheme, 'sections/*.liquid'))
  const children = sections.map(section => {
    // regexp matching for render and include tags
    let results = detectChildren({ section, filePath: section })
    if (results.snippets.length) {
      results.snippets.forEach(snippet => {
        const snippetPath = path.resolve(destTheme, `snippets/${snippet}.liquid`)
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
    fse.ensureDirSync(path.resolve(destTheme, '_features', sectionName))
    fse.moveSync(section.section, path.resolve(destTheme, '_features', sectionName, `sections/${sectionName}.liquid`))
    if (section.snippets.length) {
      fse.ensureDirSync(path.resolve(destTheme, '_features', sectionName, 'snippets'))
      section.snippets.forEach(snippet => {
        fse.moveSync(path.resolve(destTheme, `snippets/${snippet}.liquid`), path.resolve(destTheme, '_features', sectionName, 'snippets', `${snippet}.liquid`))
      })
    }
    if (section.assets.length) {
      fse.ensureDirSync(path.resolve(destTheme, '_features', sectionName, 'assets'))
      section.assets.forEach(asset => {
        fse.moveSync(path.resolve(destTheme, `assets/${asset}`), path.resolve(destTheme, '_features', sectionName, 'assets', `${asset}`))
      })
    }
  })
}

function detectChildren({ section, filePath }) {
  try {
    const source = fs.readFileSync(filePath, 'utf8')
    const snippetTags = /\s*((include|render)\s['|"](\S*)['|"])\s*/gm
    const snippets = [...source.matchAll(snippetTags)].map(tag => tag[3]).filter(snippet => {
      // file exists
      return fs.existsSync(path.resolve(process.cwd(), `converted-theme/snippets/${snippet}.liquid`))
    })
    const assetUrl = /['|"](\S*)['|"]\s*[|]\s*asset_url/gm
    const assets = [...source.matchAll(assetUrl)].map(tag => tag[1]).filter(asset => {
      // file exists
      return fs.existsSync(path.resolve(process.cwd(), `converted-theme/assets/${asset}`))
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
