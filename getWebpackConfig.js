var path = require('path');
var webpack = require('webpack');
var _ = require('lodash');


module.exports = function(options) {
  var config = {
    entry: [
      './src/js/main.js'
    ],

    output: {
      path: path.join(__dirname, 'build'),
      filename: 'app.js',
      publicPath: ''
    },

    plugins: [
      new webpack.optimize.UglifyJsPlugin(),
      new webpack.optimize.DedupePlugin()
    ],

    resolve: {
      extensions: ['', '.js']
    },

    module: {
      loaders: [
        {
          test: /\.js$/,
          loaders: ['babel?stage=0'],
          include: path.join(__dirname, 'src/js')
        },
        {
          test: /\.jpe?g$|\.gif$|\.png$|\.svg$|\.woff$|\.ttf$|\.wav$|\.mp3$/,
          loader: "file"
        }
      ]
    },

    node: {
      console: true,
      fs: 'empty',
      net: 'empty',
      tls: 'empty'
    },
  };

  if (options.environment === 'dev') {
    config.devtool = 'source-map';
    Array.prototype.unshift.call(
      config.entry,
      'webpack-dev-server/client?http://0.0.0.0:8686',
      'webpack/hot/only-dev-server'
    );
    config.plugins = [
      new webpack.HotModuleReplacementPlugin(),
      new webpack.NoErrorsPlugin()
    ];
    config.module.loaders[0].loaders.unshift('react-hot');
  }

  config.module.loaders.unshift({
    test: require.resolve("react"),
    loader: "expose?React"
  });

  return config;
};
