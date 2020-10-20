import path from "path"

const outputPath = path.resolve(__dirname, 'dist');

// TODO: figure out how to share base TS and Webpack configs from Lens (npm, filesystem, etc?)
export default [
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
        "@lens/extensions": "var global.LensExtensions",
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
      filename: 'main.js',
      path: outputPath,
    },
  },
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
        "@lens/ui-extensions": "var global.LensExtensions",
        "@lens/extensions": "var global.LensMainExtensions",
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
      path: outputPath,
    },
  },
];
