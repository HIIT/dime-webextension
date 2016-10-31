const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
module.exports = require('./webpack.base')({
  entry: {
    'global-safari': './src/safari/global-safari.js',
  },
  output: {
    path: `${__dirname}/build/safari`,
    filename: '[name].js',
  },
  devtool: 'inline-source-map',
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
});
