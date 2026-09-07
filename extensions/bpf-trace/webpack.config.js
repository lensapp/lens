const path = require("path");

function makeConfig(entry, filename) {
  return {
    entry: `./${entry}`,
    context: __dirname,
    target: "electron-renderer",
    devtool: "source-map",
    resolve: {
      extensions: [".tsx", ".ts", ".js"],
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: "ts-loader",
          exclude: /node_modules/,
        },
      ],
    },
    // Lens provides these at runtime; they must not be bundled.
    externals: {
      "@k8slens/extensions": "var global.LensExtensions",
      react: "var global.React",
      mobx: "var global.Mobx",
      "mobx-react": "var global.MobxReact",
    },
    output: {
      libraryTarget: "commonjs2",
      filename,
      path: path.resolve(__dirname, "dist"),
    },
    node: {
      __dirname: false,
      __filename: false,
    },
  };
}

module.exports = [
  makeConfig("main.ts", "main.js"),
  makeConfig("renderer.tsx", "renderer.js"),
];
