const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const CopyPlugin = require('copy-webpack-plugin')
const { ESBuildMinifyPlugin } = require('esbuild-loader')
const RemoveEmptyScriptsPlugin = require('webpack-remove-empty-scripts')
const WebpackAssetsManifest = require('webpack-assets-manifest')
const webpack = require('webpack')
const path = require('path')
const glob = require('glob')
const PrepareInstalls = require('./build-scripts/prepare-installs')
const LiquidCleanupPlugin = require('./build-scripts/liquid-cleanup-plugin')
const RemoveFilesPlugin = require('./build-scripts/remove-files')
const SettingsMergePlugin = require('./build-scripts/settings-merge-plugin')
const { RetryChunkLoadPlugin } = require('./build-scripts/retry-chunk-load-plugin')
const SVGSpritemapPlugin = require('svg-spritemap-webpack-plugin')
const { renderTemplate } = require('./build-scripts/render-template')
const TerserPlugin = require('terser-webpack-plugin')

global.ThemeRequire = require('./build-scripts/theme-require')
// deprecated process.THEME_REQUIRE in favor of ThemeRequire
process.THEME_REQUIRE = require('./build-scripts/theme-require')

const flattenShopifyDirectoryStructure = require('./build-scripts/flatten-shopify-directory-structure')

const BuildConfig = require(path.resolve(process.cwd(), 'build.config.js'))

function singleAsset(dir, name, searchGlob) {
  const file = glob.sync(path.resolve(process.cwd(), `./src/${dir}/${name}/${searchGlob}`)).flat()[0]
  process.BUILD.files.push(file)
  return file
}

function singleAssetObj(dir, name, searchGlob) {
  const file = glob.sync(path.resolve(process.cwd(), `./src/${dir}/${name}/${searchGlob}`)).flat()[0]
  process.BUILD.files.push(file)
  const obj = {
    name,
    project: file
  }
  if (obj.project) return obj
  obj.package = framework
  return obj
}

function entryFilesGlob(dir, name) {
  return glob.sync(path.resolve(process.cwd(), `./src/${dir}/${name}/**/{*.liquid,schema/*.json,config/*.json}`)).flat().filter(file => !file.includes('partials'))
}

module.exports = function({ ENV, BUILD_MINIFY = true }) {
  process.BUILD.files = []

  const BUILD = {
    features: [],
    features_assets: [],
    features_js: [],
    elements: [],
    elements_assets: [],
    elements_js: [],
    critical: [],
    app: [],
    app_js: [],
    liquid: [],
    appLiquid: [],
  }
  const INSTALLS = []

  // BUILD BASE
  BUILD.base = glob.sync(path.resolve(process.cwd(), './src/{layout,snippets,sections,templates,config,_schema}/**/*.{liquid,json,svg}'))

  BuildConfig.elements.forEach(elm => {
    const critical = singleAsset('_elements', elm, '/**/critical.css')
    if (critical) BUILD.critical.push(critical)
    const install = singleAsset('_elements', elm, '**/install.js')
    if (install) INSTALLS.push(install)

    const element = entryFilesGlob('_elements', elm)
    if (element.length) BUILD.elements = BUILD.elements.concat(element)
    const elementAssets = glob.sync(path.resolve(process.cwd(), `./src/_elements/${elm}/assets/**/*`)).flat()
    if (elementAssets.length) BUILD.elements_assets = BUILD.elements_assets.concat(elementAssets)
    const elementJS = singleAssetObj('_elements', elm, 'index.js')
    if (elementJS.project || elementJS.package) BUILD.elements_js.push(elementJS)
  })

  BuildConfig.features.forEach(feat => {
    const critical = singleAsset('_features', feat, '**/critical.css')
    if (critical) BUILD.critical.push(critical)
    const install = singleAsset('_features', feat, '**/install.js')
    if (install) INSTALLS.push(install)

    const feature = entryFilesGlob('_features', feat)
    if (feature.length) BUILD.features = BUILD.features.concat(feature)
    const featureAssets = glob.sync(path.resolve(process.cwd(), `./src/_features/${feat}/assets/**/*`)).flat()
    if (featureAssets.length) BUILD.features_assets = BUILD.features_assets.concat(featureAssets)
    const featureJS = singleAssetObj('_features', feat, 'index.js')
    if (featureJS.project || featureJS.package) BUILD.features_js.push(featureJS)
  })

  BuildConfig.app.forEach(app => {
    const critical = singleAsset('_app', app, '**/critical.css')
    if (critical) BUILD.critical.push(critical)
    const install = singleAsset('_app', app, '**/install.js')
    if (install) INSTALLS.push(install)

    const applet = entryFilesGlob('_app', app)
    if (applet.length) BUILD.app = BUILD.app.concat(applet)
    const appJS = singleAssetObj('_app', app, 'index.js')
    if (appJS.project || appJS.package) BUILD.app_js.push(appJS)
  })

  BuildConfig.liquid.forEach(liq => {
    const install = singleAsset('_features', liq, '**/install.js')
    if (install) INSTALLS.push(install)

    const liquid = entryFilesGlob('_features', liq)
    if (liquid.length) BUILD.liquid = BUILD.liquid.concat(liquid)
  })

  BuildConfig.appLiquid.forEach(appLiquid => {
    const install = singleAsset('_app', appLiquid, '**/install.js')
    if (install) INSTALLS.push(install)

    const app = entryFilesGlob('_app', appLiquid)
    if (app.length) BUILD.appLiquid = BUILD.appLiquid.concat(app)
  })

  BUILD.installables = [].concat(BuildConfig.liquid, BuildConfig.appLiquid).flat()
  BUILD.installables_js = [].concat(BuildConfig.liquid, BuildConfig.appLiquid).flat().map(feat => singleAssetObj('**', feat, 'index.js')).filter(feat => feat.project || feat.package).flat()
  BUILD.assets = [].concat(BUILD.elements_assets, BUILD.features_assets)

  process.BUILD = process.BUILD || { installs: [] }

  // dynamically create our dynamic imports so the webpack build doesn't include everything
  const jsLiquidTemplates = glob.sync(path.resolve(__dirname, './src/scripts/**.js.liquid')).map(file => file.slice(file.lastIndexOf('/') + 1, file.lastIndexOf('.')))
  const liquidTemplateData = { apps: BUILD.apps_js, features: BUILD.features_js, elements: BUILD.elements_js, installables: BUILD.installables, installables_js: BUILD.installables_js, app_js: BUILD.app_js }

  /*
    ALLOWED HOSTS Liquid Prebuild to access the config file in liquid snippet
  */
  if (BuildConfig.liquid.includes('allowed-hosts')) {
    liquidTemplateData.hosts = require(path.resolve(process.cwd(), 'allowed-hosts.config.js'))
    const prebuilds = glob.sync(path.resolve(__dirname, './src/_features/allowed-hosts/partials/*.prebuild.liquid'))
    prebuilds.forEach((prebuild) => {
      renderTemplate({
        data: liquidTemplateData,
        templatePath: prebuild,
        destination: prebuild.replace('.prebuild', '')
      })
    })
  }

  jsLiquidTemplates.forEach(file => {
    renderTemplate({
      data: liquidTemplateData,
      templatePath: path.resolve(__dirname, `./src/scripts/${file}.liquid`),
      destination: path.resolve(__dirname, `./src/scripts/${file}`)
    })
  })

  const entries = {}
  // JS & css
  glob.sync('./src/sections/**/*.{js,css}').reduce((acc, file) => {
    const entryname = file.slice(file.lastIndexOf('/') + 1, file.lastIndexOf('.'))
    entries[entryname] ? entries[entryname].push(file) : entries[entryname] = [file]
    return acc
  }, {})
  entries.critical = ['Framework/styles/critical.css', ...BUILD.critical]
  entries.main = ['Framework/scripts/main.js', 'Framework/styles/main.css']
  entries.checkout = ['Framework/scripts/checkout.js', 'Framework/styles/checkout.css']
  entries.theme_editor = ['Framework/scripts/customizer.js', 'Framework/styles/customizer.css']
  entries.theme_build = ['Framework/scripts/theme_build.js', BUILD.base, BUILD.features, BUILD.app, BUILD.elements, BUILD.liquid, BUILD.appLiquid].flat()

  // PREPARE install.js files
  PrepareInstalls(INSTALLS)

  const WebpackOptions = {
    mode: ENV,
    entry: entries,
    output: {
      path: path.resolve(process.cwd(), 'dist'),
      publicPath: '',
      filename: 'assets/[name].js?h=[contenthash:5]',
      chunkFilename: (pathData) => {
      // trim filenames so they're not super long... append 5 character hash
        const name = pathData.chunk.name
        const id = String(name || pathData.chunk.id).replace('node_modules_', '').substring(0, 25)
        if (name === undefined) {
          return `assets/shared-${id}${pathData.chunk.contentHash.javascript.substring(0, 5)}.js?h=[contenthash:5]`
        }
        if (id.length > 25) {
          return `assets/${id}${pathData.chunk.contentHash.javascript.substring(0, 5)}.js?h=[contenthash:5]`
        }
        return 'assets/[name].js?h=[contenthash:5]'
      }
    },
    context: __dirname, // set the context of your app to be the project directory
    node: {
      __dirname: true // Allow use of __dirname in modules, based on context
    },
    resolve: {
      alias: {
        App: path.resolve(__dirname, 'src/_app'),
        // look in process.cwd() because that is client root when run from client
        Elements: path.resolve(__dirname, 'src/_elements'),
        Features: path.resolve(__dirname, 'src/_features'),
        Framework: path.resolve(__dirname, 'src'),
        Root: path.resolve(process.cwd()),
        Utils: path.resolve(__dirname, 'build-scripts'),
      },
      modules: ['node_modules'],
    },
    module: {
      rules: [
        {
          test: /(\.css)$/,
          include: /node_modules/,
          exclude: /@softlimit/,
          use: [
            MiniCssExtractPlugin.loader,
            { loader: 'css-loader', options: { url: false } }
          ],
        },
        {
          test: /(\.css)$/,
          include: /(@softlimit|src)/,
          use: [
            MiniCssExtractPlugin.loader,
            { loader: 'css-loader', options: { url: false } },
            'postcss-loader',
          ],
        },
        {
          test: /\.(liquid)$/i,
          type: 'asset/resource',
          generator: {
            filename: function(file) {
              return flattenShopifyDirectoryStructure(file.filename)
            }
          },
          use: [
            {
              loader: 'install-schema-loader',
            },
            {
              loader: 'extend-liquid-loader',
            },
            {
              loader: 'liquid-schema-loader'
            },
            {
              loader: 'softlimit-schema'
            },
          ]
        },
        {
          test: /\.(woff|woff2|ttf|svg|eot)$/i,
          exclude: [path.resolve(process.cwd(), 'src/snippets/'), path.resolve(__dirname, 'src/snippets/')],
          loader: 'file-loader',
          options: {
            name: '[name].[ext]',
            outputPath: (url, resourcePath, context) => {
              return `assets/${url}`
            },
            publicPath: (url, resourcePath, context) => {
              return `${url}`
            }
          }
        },
        {
          test: /\.(json)/,
          type: 'asset/resource',
          exclude: /(snippets|sections|install|\/_schema|locales)/,
          include: /(config|templates)/,
          generator: {
            filename: function({ filename }) {
              const file = filename.slice(filename.lastIndexOf('/') + 1)
              if (filename.includes('config')) {
                return `config/${file}`
              }
              if (filename.includes('locales')) {
                return `locales/${file}`
              }
              if (filename.includes('templates')) {
                return `templates/${file}`
              }
              return `assets/${file}`
            }
          }
        },
        {
          test: /\.(svg)$/i,
          include: [path.resolve(process.cwd(), 'src/snippets/'), path.resolve(__dirname, './src/snippets/')],
          use: [{
            loader: 'file-loader',
            options: {
              name: '[name].liquid',
              outputPath: (url, resourcePath, context) => {
                return `snippets/${url}`
              }
            }
          }
          ]
        },
      ]
    },
    plugins: [
      new RemoveFilesPlugin({}),
      new RemoveEmptyScriptsPlugin(), // removes entry js files that are automatically generated even if the entry point is only css
      new SVGSpritemapPlugin('./{src/_features,node_modules/@softlimit/framework/src/_features}/localization-form/**/*.svg', {
        output: {
          filename: 'snippets/icon-flag-spritemap.liquid',
          svgo: true
        }
      }),
      new webpack.DefinePlugin({
        'process.env.NODE_THEME': JSON.stringify(THEME),
        'process.env.BUILD_INSTALLABLES': JSON.stringify(BUILD.installables)
      }),
      new MiniCssExtractPlugin({
        filename: 'assets/[name].css?h=[chunkhash:5]'
      }),
      new CopyPlugin({
        patterns: [
          { // when run from a client theme
            from: path.resolve(process.cwd(), './src/assets/**/*'),
            to: './assets/[name][ext]',
            noErrorOnMissing: true
          },
          {
            from: path.resolve(__dirname, './src/assets/**/*'),
            to: './assets/[name][ext]',
            noErrorOnMissing: true
          },
          {
            from: path.resolve(__dirname, './src/locales/**/*'),
            to: './locales/[name][ext]'
          },
          ...BUILD.assets.map((asset) => { return { from: asset, to: './assets/[name][ext]' } })
        ]
      }),
      new SettingsMergePlugin({}),
      new LiquidCleanupPlugin({}),
      new RetryChunkLoadPlugin({
      // optional value to set the amount of time in milliseconds before trying to load the chunk again. Default is 0
        retryDelay: 0,
        // optional value to set the maximum number of retries to load the chunk. Default is 1
        maxRetries: 3
      }),
      ...process.env.mode === 'production'
        ? [new WebpackAssetsManifest({
            output: 'sections/manifest.liquid',
            transform: (manifest) => {
              return Object.fromEntries(Object.entries(manifest).map(entry => {
                return [[entry[0].replace('assets/', '')], `{{ '${entry[1].replace('assets/', '')}' | asset_url }}`]
              }).filter(arr => ['.js', '.css'].includes(arr[0][0].slice(arr[0][0].lastIndexOf('.')))))
            },
          })]
        : [],
    ],
    watchOptions: {
      aggregateTimeout: 200,
      ignored: ['**/node_modules', '**/dist/**/*', '**/src/templates/**/*.json', '**/src/config/settings_data.json']
    },
    stats: 'minimal',
    resolveLoader: {
      modules: [
        'node_modules',
        path.resolve(__dirname, './build-scripts')
      ]
    },
    optimization: {
      minimize: BUILD_MINIFY,
      splitChunks: {
        automaticNameDelimiter: '_'
      },
      sideEffects: false,
      minimizer: [
        (process.env.mode === 'production')
          ? new ESBuildMinifyPlugin({
            target: 'es2015', // Syntax to compile to (see options below for possible values)
            exclude: BUILD.assets.map(asset => asset.slice(asset.lastIndexOf('assets/'))), // Exclude assets files from the compilation
          })
          : new TerserPlugin({
            extractComments: false,
          }),
      ]
    }
  }

  return WebpackOptions
}

function flattenObjectPath(item) {
  if (typeof item === 'object') item = item.project || item.package
  return item
}
