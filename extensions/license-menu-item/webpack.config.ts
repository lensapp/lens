import path from "path"

const outputPath = path.resolve(__dirname, 'dist');

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
    externals: {
      "@k8slens/extensions": "var global.LensExtensions",
      "mobx": "var global.Mobx",
    },
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
];
