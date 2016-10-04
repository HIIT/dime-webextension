const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: {
    'dime.content': './src/webextension/dime.content.js',
    'dime.background': './src/webextension/dime.background.js',
    'dime.options': './src/webextension/dime.options.js',
  },
  output: {
    path: `${__dirname}/build/webextension`,
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
    new CopyWebpackPlugin([
      {
        from: './src/webextension/manifest.json',
        to: 'manifest.json',
      },
      {
        from: './src/webextension/dime.options.html',
        to: 'dime.options.html',
      },
      {
        from: 'src/icons',
      },
    ], {
      ignore: [],
      copyUnmodified: true,
    }),
  ],
};
