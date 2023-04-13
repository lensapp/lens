const ForkTsCheckerPlugin = require("fork-ts-checker-webpack-plugin");
const { MakePeerDependenciesExternalPlugin } = require("./plugins/make-peer-dependencies-external");
const { ProtectFromImportingNonDependencies } = require("./plugins/protect-from-importing-non-dependencies");

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
    extensions: [".ts", ".tsx", ".js"],
  },

  plugins: [
    new MakePeerDependenciesExternalPlugin(),
    new ProtectFromImportingNonDependencies(),

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
