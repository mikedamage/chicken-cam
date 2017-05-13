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
};
