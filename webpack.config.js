const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './index.web.js',
  mode: 'development',
  devtool: 'cheap-module-source-map',
  module: {
    rules: [
      {
        test: /\.(js|jsx|ts|tsx)$/,
        exclude: /node_modules\/(?!(react-native-.*|@react-native.*)\/).*/,
        use: {
          loader: 'babel-loader',
          options: {
            cacheDirectory: true,
            presets: ['module:@react-native/babel-preset'],
            plugins: []
          }
        }
      },
      {
        test: /\.(png|jpe?g|gif|svg)$/,
        type: 'asset/resource',
        generator: {
          filename: 'assets/[name][ext]'
        }
      }
    ]
  },
  resolve: {
    extensions: ['.web.js', '.js', '.web.jsx', '.jsx', '.web.ts', '.ts', '.web.tsx', '.tsx', '.json'],
    alias: {
      'react-native$': 'react-native-web',
      'react-native-chart-kit': 'react-native-chart-kit/dist'
    },
    fallback: {
      "crypto": false,
      "stream": false,
      "buffer": false
    }
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
    publicPath: '/',
    clean: true
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html',
      inject: true
    })
  ],
  devServer: {
    static: {
      directory: path.join(__dirname, 'dist')
    },
    compress: true,
    port: 3000,
    historyApiFallback: true,
    open: true,
    hot: true
  },
  optimization: {
    splitChunks: {
      chunks: 'all',
    },
  }
};