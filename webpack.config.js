const path = require('path');

module.exports = {
  context: path.resolve(__dirname),
  resolve: {
    extensions: [ '.js', '.jsx', '.json' ],
    modules: [
      'app/js',
      'lib',
      'node_modules',
    ],
  },
  entry: {
    main: 'app/js/main',
  },
  module: {
    rules: [

    ],
  },
  output: {
    chunkFilename: '[id].[name].js',
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'app', 'assets'),
    publicPath: '/assets/',
  },
  devtool: 'source-map'
};
