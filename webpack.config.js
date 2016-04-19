var CopyWebpackPlugin = require('copy-webpack-plugin');
module.exports = {
  entry: {
    'dime.content': './src/chrome/dime.content.js',
    'dime.logger': './src/chrome/dime.logger.js',
    'dime.background': './src/chrome/dime.background.js',
    'dime.options': './src/chrome/dime.options.js',
    'RankTermsWebWorker': './src/chrome/RankTermsWebWorker.js',
  },
  output: {
    path: __dirname + '/build/chrome',
    filename: '[name].js',
  },
  node: {
    net: "empty",
    tls: "empty",
    fs: "empty",
  },
  module: {
    loaders: [
      {
        test: /\.json$/,
        loader: "json-loader"
      },
      {
        test: /\.js?$/,
        exclude: /node_modules/,
        loader: 'babel'
      },
      {
        test: /\.md$/,
        loader: "html!markdown"
      }
    ]
  },
  resolve: {
    extensions: ['', '.js', '.jsx', '.json']
  },
  plugins: [
    new CopyWebpackPlugin([
      {
        from: './src/chrome/manifest.json',
        to: 'manifest.json' //+output.path
      },
      {
        from: './src/chrome/dime.options.html',
        to: 'dime.options.html' //+output.path
      },
      {
        from: 'src/icons/'
      }
    ], {
      ignore: [],
      copyUnmodified: true
    })
  ]
};
