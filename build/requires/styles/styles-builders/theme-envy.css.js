const fs = require('fs-extra')
const path = require('path')
const getAll = require('#Build/functions/get-all.js')

const criticalCSS = getAll('criticalCSS')

const markup = `${ThemeEnvy.tailwind !== false
? `@import 'tailwindcss/base';
@import 'tailwindcss/components';
@import 'tailwindcss/utilities';`
: ''}
${criticalCSS.map(file => `@import '${file}';`).join('\n')}
`

fs.writeFileSync(path.resolve(__dirname, '../theme-envy.css'), markup, 'utf8')
