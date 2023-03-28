/**
  * @file Gets all files of a given type
  * @param {string} type - The type of files to get
  * @example
  * // get all liquid files
  * getAll('liquid')
  * @example
  * // get all config files
  * getAll('config')
  * @returns {array} - array of file paths
  */
const path = require('path')
const glob = require('glob')
const parentThemeFiles = require('./parent-theme-files')

const globs = {
  assets: {
    glob(src) {
      return glob.sync(path.resolve(src, '**/assets/**/*'))
    },
  },
  config: {
    glob(src) {
      return glob.sync(path.resolve(src, '**/config/**/*.js'))
    },
    filter: file => path.basename(file) !== 'settings_schema.js',
  },
  elements: {
    glob(src) {
      return [...glob.sync(path.resolve(src, '**/elements/**/index.js')), ...glob.sync(path.resolve(src, '**/elements/*.js'))]
    }
  },
  features: {
    glob(src) {
      return glob.sync(path.resolve(src, 'theme-envy/features/**/index.js'))
    },
  },
  installs: {
    glob(src) {
      return glob.sync(path.resolve(src, '**/install.js'))
    },
  },
  liquid: {
    glob(src) {
      return glob.sync(path.resolve(src, '**/*.liquid'))
    },
    filter: file => !file.includes('partials'),
  },
  partials: {
    glob(src) {
      return glob.sync(path.resolve(src, '**/partials/**/*.liquid'))
    },
  },
  schema: {
    glob(src) {
      return glob.sync(path.resolve(src, '**/schema/**/*.js'))
    },
  },
  sectionGroups: {
    glob(src) {
      return glob.sync(path.resolve(src, '**/sections/**/*.json'))
    },
  },
  templates: {
    glob(src) {
      return glob.sync(path.resolve(src, '**/templates/**/*.json'))
    },
  },
}

module.exports = function(type) {
  function getFiles(src, only) {
    // src is either the themePath or the parentTheme
    // only is a list of directory names to filter against, used for parentTheme
    let files = globs[type].glob(src)
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
  const files = getFiles(ThemeEnvy.themePath)
  if (ThemeEnvy.parentTheme) {
    files.push(...parentThemeFiles(getFiles, files, type))
  }

  return files
}
