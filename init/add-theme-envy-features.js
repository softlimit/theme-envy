/*
  Copies _features during theme-envy init
*/
const fs = require('fs-extra')
const path = require('path')
const glob = require('glob')

module.exports = function() {
  const featuresDir = path.resolve(__dirname, '../build/_features')
  const initFeatures = glob.sync(`${featuresDir}/**`).filter(ref => fs.statSync(ref).isDirectory() && ref !== featuresDir)
  initFeatures.forEach(feature => {
    console.log('Copying feature: ', path.basename(feature))
    fs.copySync(feature, path.resolve(process.cwd(), 'src/_features', path.basename(feature)))
  })
}
