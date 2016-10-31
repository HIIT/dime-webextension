const webpack = require('webpack');
const webpackExtensionDevConfig = require('./webpack.webextension');
module.exports = require('./webpack.base')({
  entry: webpackExtensionDevConfig.entry,
  output: webpackExtensionDevConfig.output,
  devtool: null,
  plugins: webpackExtensionDevConfig.plugins.concat([
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('production'),
      },
    }),
    // Merge all duplicate modules
    new webpack.optimize.DedupePlugin(),
  ]),
});
