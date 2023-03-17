/*
  * use getAll(type) to get all files of a given type
*/
const path = require('path')
const glob = require('glob')
const parentThemeFiles = require('./parent-theme-files')

const globs = {
  assets: {
    glob: '**/assets/**/*',
  },
  config: {
    glob: '**/config/*.js',
    filter: file => path.basename(file) !== 'settings_schema.js',
  },
  elements: {
    glob: '_elements/**/index.js',
  },
  features: {
    glob: '_features/**/index.js',
  },
  installs: {
    glob: '**/install.js',
  },
  liquid: {
    glob: '**/*.liquid',
    filter: file => !file.includes('partials'),
  },
  partials: {
    glob: '**/partials/*.liquid',
  },
  schema: {
    glob: '**/{schema,_schema}/*.js',
  },
  sectionGroups: {
    glob: '**/sections/*.json',
  },
  templates: {
    glob: '**/templates/*.json',
  },
}

module.exports = function(type) {
  function getFiles(src, only) {
    // src is either the themeRoot or the parentTheme
    // only is a list of directory names to filter against, used for parentTheme
    let files = glob.sync(path.resolve(src, globs[type].glob))
    if (only) {
      files = files.filter(file => {
        return only.some(dir => file.indexOf(dir) > -1)
      })
    }
    if (globs[type].filter) {
      files = files.filter(globs[type].filter)
    }
    return files
  }
  const files = getFiles(process.build.themeRoot)
  if (process.build.parentTheme) {
    files.push(...parentThemeFiles(getFiles, files, type))
  }

  return files
}
