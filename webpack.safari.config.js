const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
module.exports = {
  entry: {
    'global-safari': './src/webextension/global-safari.js',
  },
  output: {
    path: `${__dirname}/build/safari`,
    filename: '[name].js',
  },
  node: {
    net: 'empty',
    tls: 'empty',
    fs: 'empty',
    child_process: 'empty',
    dns: 'empty',
  },
  devtool: 'inline-source-map',
  module: {
    exprContextRegExp: /$^/,
    exprContextCritical: false,
    loaders: [
      {
        test: /\.json$/,
        loader: 'json-loader',
      },
      {
        test: /\.js?$/,
        exclude: /node_modules/,
        loader: 'babel',
      },
      {
        test: /\.css$/,
        loader: 'style-loader!css-loader',
      },
      {
        test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'file',
      },
      {
        test: /\.(woff|woff2)$/,
        loader: 'url?prefix=font/&limit=5000',
      },
      {
        test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'url?limit=10000&mimetype=application/octet-stream',
      },
      {
        test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'url?limit=10000&mimetype=image/svg+xml',
      },
    ],
  },
  resolve: {
    extensions: ['', '.js', '.jsx', '.json'],
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'DiMe',
      filename: 'global-safari.html',
      inject: true,
      xhtml: true,
    }),
    new CopyWebpackPlugin([
      {
        from: './src/safari/endscript-safari.js',
        to: 'endscript-safari.js',
      },
      {
        from: './src/safari/Icon.png',
        to: 'Icon.png',
      },
      {
        from: './src/safari/Info.plist',
        to: 'Info.plist',
      },
      {
        from: './src/safari/Settings.plist',
        to: 'Settings.plist',
      },
    ], {
      ignore: [],
      copyUnmodified: true,
    }),
  ],
};
