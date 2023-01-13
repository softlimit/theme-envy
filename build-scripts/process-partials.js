/*
  Function that reads a string (input) and replaces all softlimit tags with the rendered file
  - input is the string to be processed
  - returns string
*/

const BuildTime = require('./build-time')

const strings = {
  startString: '<!-- softlimit',
  endString: '-->'
}
const regexStr = String.raw`${strings.startString}.*?${strings.endString}`
const search = RegExp(regexStr, 'gs')

// regexp for in between curly braces, inclusive
const jsonRegex = /{(.*?)}/g

const processPartials = (input) => {
  const timer = new BuildTime()
  const matches = [...input.matchAll(search)]
  if (matches.length === 0) {
    timer.report()
    return input
  }
  // we have a softlimit tag(s), so we need to process it
  matches.forEach(match => {
    // match[0] is the string we will replace
    // partial is the JSON object contained within the softlimit tag
    const tag = JSON.parse([...match[0].matchAll(jsonRegex)][0][0])
    // ignore softlimit tags that are not partial references
    if (tag.action !== 'partial') return
    const file = ThemeRequire(`${tag.file}.liquid`, { globStr: './src/**/partials/**/' })
    input = input.replace(match[0], processPartials(file))
  })
  timer.report()
  return input
}

module.exports = processPartials
