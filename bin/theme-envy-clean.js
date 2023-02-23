const rimraf = require('rimraf')
const path = require('path')
const fs = require('fs')

module.exports = function() {
  const promise = new Promise((resolve, reject) => {
    rimraf(path.resolve(process.cwd(), 'dist'), () => {
      try {
        fs.mkdirSync(path.resolve(process.cwd(), 'dist'))
      } catch (error) {
        throw new Error(error)
      }
      console.log('./dist directory cleaned')
      resolve()
    })
  })
  return promise
}
