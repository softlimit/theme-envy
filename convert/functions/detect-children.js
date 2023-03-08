const fs = require('fs-extra')
const path = require('path')

module.exports = function({ section, filePath, root }) {
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
