const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = require('./webpack.base')({
  entry: {
    'background.storeSetDefaults': ['./src/webextension/background.storeSetDefaults.js'],
    'background.stateCheckers': ['./src/webextension/background.stateCheckers.js'],
    'background.UIActionsHandlers': ['./src/webextension/background.UIActionsHandlers.js'],
    'background.UIStatesHandlers': ['./src/webextension/background.UIStatesHandlers.js'],
    'background.getPureHTML': ['./src/webextension/background.getPureHTML.js'],
    'background.getArticle': ['./src/webextension/background.getArticle.js'],
    'background.getFrequentWords': ['./src/webextension/background.getFrequentWords.js'],
    'background.getLinks': ['./src/webextension/background.getLinks.js'],
    'background.getMetaTags': ['./src/webextension/background.getMetaTags.js'],
    'background.tabsUpdateHandler': ['./src/webextension/background.tabsUpdateHandler.js'],
    'background.sendToDiMe': ['./src/webextension/background.sendToDiMe.js'],
    content: ['./src/webextension/content.js'],
    options: ['./src/webextension/options.js'],
  },
  output: {
    path: `${__dirname}/build/webextension`,
    filename: '[name].js',
  },
  devtool: 'inline-source-map',
  plugins: [
    new CopyWebpackPlugin([
      {
        from: './src/webextension/manifest.json',
        to: 'manifest.json',
      },
      {
        from: './src/webextension/options.html',
        to: 'options.html',
      },
      {
        from: 'src/icons',
      },
    ], {
      ignore: [],
      copyUnmodified: true,
    }),
  ],
});
