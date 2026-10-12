// webpack, not Vite: Vite builds an app without the optional peers either way (it replaces an
// unresolvable import with one that throws), while webpack and Turbopack fail the build unless the
// library keeps each peer import() inside a try block. webpack reports those as warnings.
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: 'production',
  entry: './src/main.js',
  output: { path: __dirname + '/dist', clean: true },
  module: { rules: [{ test: /\.css$/, use: ['style-loader', 'css-loader'] }] },
  plugins: [
    new HtmlWebpackPlugin({ templateContent: '<!doctype html><html lang="en"><head><meta charset="utf-8"><title>nopeers</title></head><body><div id="root"></div></body></html>' }),
  ],
  performance: { hints: false },
};
