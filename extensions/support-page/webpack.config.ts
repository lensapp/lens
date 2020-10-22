import path from "path"

const outputPath = path.resolve(__dirname, 'dist');

// TODO: figure out how to share base TS and Webpack configs from Lens (npm, filesystem, etc?)
const lensExternals = {
  "@k8slens/extensions": "var global.LensExtensions",
  "react": "var global.React",
  "mobx": "var global.Mobx",
  "mobx-react": "var global.MobxReact",
};

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
      lensExternals,
    ],
    resolve: {
      extensions: ['.tsx', '.ts', '.js'],
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
      lensExternals,
    ],
    resolve: {
      extensions: ['.tsx', '.ts', '.js'],
    },
    output: {
      libraryTarget: "commonjs2",
      globalObject: "this",
      filename: 'renderer.js',
      path: outputPath,
    },
  },
];
