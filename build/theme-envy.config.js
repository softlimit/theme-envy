const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const TerserPlugin = require('terser-webpack-plugin')
const RemoveEmptyScriptsPlugin = require('webpack-remove-empty-scripts')
const { ESBuildMinifyPlugin } = require('esbuild-loader')
const path = require('path')

module.exports = {
  entry: {
    'theme-envy': path.resolve(__dirname, 'requires/scripts/theme-envy.js'),
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
        ? new ESBuildMinifyPlugin({
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
      Elements: path.resolve(ThemeEnvy.themePath, 'theme-envy/elements/'),
      Features: path.resolve(ThemeEnvy.themePath, 'theme-envy/features/'),
      Root: path.resolve(process.cwd()),
      Scripts: path.resolve(ThemeEnvy.themePath, 'scripts/'),
    },
  },
  plugins: [
    new RemoveEmptyScriptsPlugin(),
    new MiniCssExtractPlugin({
      filename: '[name].css?h=[chunkhash:5]',
    }),
  ]
}
