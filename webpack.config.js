var CopyWebpackPlugin = require('copy-webpack-plugin');
module.exports = {
  entry: {
    'dime.content': './src/chrome/dime.content.js',
    'dime.logger': './src/chrome/dime.logger.js',
    'dime.background': './src/chrome/dime.background.js',
    'dime.options': './src/chrome/dime.options.js',
  },
  output: {
    path: __dirname + '/build/chrome',
    filename: '[name].js',
  },
  node: {
    net: "empty",
    tls: "empty",
    fs: "empty",
    child_process: 'empty',
    dns: 'empty'
  },
  devtool: 'inline-source-map',
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
      //{
      //  test: /\.md$/,
      //  loader: "html!markdown"
      //},
      {
        test: /\.css$/,
        loader: 'style-loader!css-loader'
      },
      {
        test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
        loader: "file"
      },
      {
        test: /\.(woff|woff2)$/,
        loader:"url?prefix=font/&limit=5000"
      },
      {
        test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
        loader: "url?limit=10000&mimetype=application/octet-stream"
      },
      {
        test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
        loader: "url?limit=10000&mimetype=image/svg+xml"
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
        from: 'src/icons'
      }
    ], {
      ignore: [],
      copyUnmodified: true
    })
  ]
};