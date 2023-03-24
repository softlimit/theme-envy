const fs = require('fs-extra')
const path = require('path')
const glob = require('glob')
const logSymbols = require('#LogSymbols')
const detectChildren = require('./detect-children')

module.exports = function({ sourceTheme }) {
  // figure out if we can separate any sections into features
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

  // move sections with unique children to theme-envy/features
  sectionsWithUniqueChildren.forEach(section => {
    const sectionName = path.basename(section.section, '.liquid')
    fs.ensureDirSync(path.resolve(sourceTheme, 'theme-envy/features', sectionName))
    fs.moveSync(section.section, path.resolve(sourceTheme, 'theme-envy/features', sectionName, `sections/${sectionName}.liquid`))
    if (section.snippets.length) {
      fs.ensureDirSync(path.resolve(sourceTheme, 'theme-envy/features', sectionName, 'snippets'))
      section.snippets.forEach(snippet => {
        fs.moveSync(path.resolve(sourceTheme, `snippets/${snippet}.liquid`), path.resolve(sourceTheme, 'theme-envy/features', sectionName, 'snippets', `${snippet}.liquid`))
      })
    }
    if (section.assets.length) {
      fs.ensureDirSync(path.resolve(sourceTheme, 'theme-envy/features', sectionName, 'assets'))
      section.assets.forEach(asset => {
        fs.moveSync(path.resolve(sourceTheme, `assets/${asset}`), path.resolve(sourceTheme, 'theme-envy/features', sectionName, 'assets', `${asset}`))
      })
    }
  })

  console.log(`${logSymbols.success} Theme sections converted to features`)
}
