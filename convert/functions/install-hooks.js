const path = require('path')
const fs = require('fs-extra')
const logSymbols = require('#LogSymbols')
const { liquidPrettify } = require('#Helpers')

const hooks = {
  '<head>': {
    after: "{% hook 'head-start' %}",
  },
  '</head>': {
    before: "{% hook 'head-end' %}",
  },
  '<body>': {
    after: "{% hook 'body-start' %}",
  },
  '</body>': {
    before: "{% hook 'body-end' %}",
  },
  '<header>': {
    after: "{% hook 'header-start' %}",
  },
  '</header>': {
    before: "{% hook 'header-end' %}",
  },
  '<main>': {
    before: "{% hook 'before-main' %}",
    after: "{% hook 'main-start' %}",
  },
  '</main>': {
    before: "{% hook 'main-end' %}",
    after: "{% hook 'after-main' %}",
  },
  '<footer>': {
    before: "{% hook 'before-footer' %}",
    after: "{% hook 'footer-start' %}",
  },
  '</footer>': {
    before: "{% hook 'footer-end' %}",
    after: "{% hook 'after-footer' %}",
  },
}

module.exports = function() {
  const themeLiquid = path.resolve(process.cwd(), 'src/layout/theme.liquid')
  if (fs.existsSync(themeLiquid)) {
    const theme = fs.readFileSync(themeLiquid, 'utf8')
    let source = theme
    Object.entries(hooks).forEach(([tag, { after, before }]) => {
      const type = tag.includes('/') ? 'closing' : 'opening'
      const tagName = type === 'closing' ? tag.replace('</', '').replace('>', '') : tag.replace('<', '').replace('>', '')
      // regexp for tag
      const checkTag = type === 'closing' ? new RegExp(`</${tagName}>`, 'gm') : new RegExp(`<${tagName}[^>]*>`, 'gm')
      const matches = source.match(checkTag)
      if (matches) {
      // insert before and after attributes around the tag matches
        matches.forEach(match => {
          let newMatch = match
          if (after && !source.includes(after)) newMatch = newMatch.replace('>', `>\n${after}`)
          if (before && !source.includes(before)) newMatch = newMatch.replace('<', `${before}\n<`)
          source = source.replace(match, newMatch)
        })
      }
    })
    source = liquidPrettify({ source, pathname: themeLiquid })
    fs.writeFileSync(themeLiquid, source, 'utf8')
  }
  console.log(`${logSymbols.success} Hooks installed\n`)
}
