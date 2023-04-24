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

// ignore node_modules in globs
const globSync = (src, pattern) => glob.sync(path.resolve(src, pattern), {
  ignore: {
    ignored: p => {
      // ignore node_modules in parent theme but not the parent theme itself (within node_modules)
      return p.fullpath().includes(path.resolve(ThemeEnvy.parentTheme.path, 'node_modules')) ? true : p.fullpath().includes('node_modules') && !p.fullpath().includes(ThemeEnvy.parentTheme.path)
    },
  }
})

const globs = {
  assets: {
    glob(src) {
      return globSync(src, '**/assets/**/*')
    },
  },
  config: {
    glob(src) {
      return globSync(src, '**/config/**/*.js')
    },
    filter: file => path.basename(file) !== 'settings_schema.js',
  },
  criticalCSS: {
    glob(src) {
      return globSync(src, '**/critical.css')
    },
  },
  elements: {
    glob(src) {
      return [...globSync(src, '**/elements/**/index.js'), ...globSync(src, '**/elements/*.js')]
    }
  },
  features: {
    glob(src) {
      return globSync(src, '**/features/**/index.js')
    },
  },
  installs: {
    glob(src) {
      return globSync(src, '**/install.js')
    },
  },
  liquid: {
    glob(src) {
      return globSync(src, '**/*.liquid')
    },
    filter: file => !file.includes('partials'),
  },
  locales: {
    glob(src) {
      return globSync(src, '**/locales/**/*.json')
    }
  },
  partials: {
    glob(src) {
      return globSync(src, '**/partials/**/*.liquid')
    },
  },
  schema: {
    glob(src) {
      return globSync(src, '**/schema/**/*.js')
    },
  },
  sectionGroups: {
    glob(src) {
      return globSync(src, '**/sections/**/*.json')
    },
  },
  snippets: {
    glob(src) {
      return globSync(src, '**/snippets/**/*.liquid')
    },
  },
  templates: {
    glob(src) {
      return globSync(src, '**/templates/**/*.json')
    },
  },
}

module.exports = function(type) {
  function getFiles(src, only) {
    // src is either the themePath or the parentTheme
    // only is a list of directory paths to filter against, used for parentTheme
    let files = globs[type].glob(src)
    if (only) {
      files = files.filter(file => {
        return only.some(dir => file.includes(`${dir}/`) || file.includes(`${dir}.js`))
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
