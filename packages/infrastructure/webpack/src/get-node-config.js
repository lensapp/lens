const ForkTsCheckerPlugin = require("fork-ts-checker-webpack-plugin");
const nodeExternals = require("webpack-node-externals");
const path = require("path");

module.exports = ({ entrypointFilePath, outputDirectory }) => ({
  name: entrypointFilePath,
  entry: { index: entrypointFilePath },
  target: "node",
  mode: "production",

  performance: {
    maxEntrypointSize: 100000,
    hints: "error",
  },

  resolve: {
    extensions: [".ts", ".tsx"],
  },

  plugins: [
    new ForkTsCheckerPlugin({
      typescript: {
        mode: "write-dts",

        configOverwrite: {
          include: [entrypointFilePath],

          compilerOptions: {
            declaration: true,
            declarationDir: outputDirectory,
          },
        },
      },
    }),
  ],

  output: {
    path: outputDirectory,

    filename: (pathData) =>
      pathData.chunk.name === "index"
        ? "index.js"
        : `${pathData.chunk.name}/index.js`,

    libraryTarget: "commonjs2",
  },

  externals: [
    nodeExternals({ modulesFromFile: true }),

    nodeExternals({
      modulesDir: path.resolve(
        __dirname,
        "..",
        "..",
        "..",
        "..",
        "node_modules"
      ),
    }),
  ],

  externalsPresets: { node: true },

  node: {
    __dirname: true,
    __filename: true,
  },

  module: {
    rules: [
      {
        test: /\.ts(x)?$/,
        loader: "ts-loader",
      },
    ],
  },
});
