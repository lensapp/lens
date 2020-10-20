const path = require('path');

module.exports = [
  {
    entry: './main.ts',
    context: __dirname,
    target: "electron-main",
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
        "@k8slens/main-extensions": "var global.LensMainExtensions",
        "mobx": "var global.Mobx",
      }
    ],
    resolve: {
      extensions: [ '.tsx', '.ts', '.js' ],
    },
    output: {
      libraryTarget: "commonjs2",
      filename: 'main.js',
      path: path.resolve(__dirname, 'dist'),
    },
  },
  {
    entry: './renderer.ts',
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
        "@k8slens/renderer-extensions": "var global.LensRendererExtensions",
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
