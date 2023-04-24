const path = require('path')
const fs = require('fs-extra')

const { EsbuildPlugin } = require('esbuild-loader')
const { RetryChunkLoadPlugin } = require('./functions/webpack-plugins/retry-chunk-load-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const RemoveEmptyScriptsPlugin = require('webpack-remove-empty-scripts')
const TerserPlugin = require('terser-webpack-plugin')
const WebpackAssetsManifest = require('webpack-assets-manifest')

module.exports = {
  entry: {
    'theme-envy': [path.resolve(__dirname, 'requires/scripts/theme-envy.js')],
  },
  output: {
    path: path.resolve(ThemeEnvy.outputPath, 'assets'),
    publicPath: '',
    filename: '[name].js?h=[contenthash:5]',
    chunkFilename: (pathData) => {
      // trim filenames so they're not super long... append 5 character hash
      const name = pathData.chunk.name
      const id = String(name || pathData.chunk.id).replace('node_modules_', '').substring(0, 25)
      if (name === undefined) {
        return `shared-${id}${pathData.chunk.contentHash.javascript.substring(0, 5)}.js?h=[contenthash:5]`
      }
      if (id.length > 25) {
        return `${id}${pathData.chunk.contentHash.javascript.substring(0, 5)}.js?h=[contenthash:5]`
      }
      return '[name].js?h=[contenthash:5]'
    }
  },
  devtool: false,
  module: {
    rules: [
      {
        test: /(\.css)$/,
        use: [
          MiniCssExtractPlugin.loader,
          { loader: 'css-loader', options: { url: false } },
          'postcss-loader',
        ],
      },
    ]
  },
  optimization: {
    splitChunks: {
      automaticNameDelimiter: '_'
    },
    sideEffects: false,
    minimizer: [
      (process.env.mode === 'production')
        ? new EsbuildPlugin({
          target: 'es2015', // Syntax to compile to (see options below for possible values)
        })
        : new TerserPlugin({
          extractComments: false,
        }),
    ]
  },
  resolve: {
    alias: {
      Build: ThemeEnvy.paths.build,
      Helpers: ThemeEnvy.paths.helpers,
      Root: path.resolve(process.cwd()),
      Scripts: path.resolve(ThemeEnvy.themePath, 'scripts/'),
    },
    modules: ['node_modules'],
  },
  resolveLoader: {
    modules: ['node_modules'],
  },
  plugins: [
    new RemoveEmptyScriptsPlugin(),
    new MiniCssExtractPlugin({
      filename: '[name].css?h=[chunkhash:5]',
    }),
    new RetryChunkLoadPlugin({
      // optional value to set the amount of time in milliseconds before trying to load the chunk again. Default is 0
      retryDelay: 0,
      // optional value to set the maximum number of retries to load the chunk. Default is 1
      maxRetries: 3
    }),
    new WebpackAssetsManifest({
      done: ({ assets }) => {
        // plugin is not outputting any manifests file, so let's do it here
        const manifestPath = path.resolve(ThemeEnvy.outputPath, 'sections/theme-envy-manifest.liquid')
        fs.writeFileSync(manifestPath, JSON.stringify(assets, null, 2))
      }
    }),
  ]
}
