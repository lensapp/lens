const path = require('path');

module.exports = [
  {
    entry: './renderer.tsx',
    context: __dirname,
    target: "electron-renderer",
    mode: "production",
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: 'ts-loader',
          exclude: /node_modules/,
        },
      ],
    },
    externals: [
      {
        "@k8slens/extensions": "var global.LensExtensions",
        "react": "var global.React",
        "mobx": "var global.Mobx"
      }
    ],
    resolve: {
      extensions: [ '.tsx', '.ts', '.js' ],
    },
    output: {
      libraryTarget: "commonjs2",
      globalObject: "this",
      filename: 'renderer.js',
      path: path.resolve(__dirname, 'dist'),
    },
  },
];
