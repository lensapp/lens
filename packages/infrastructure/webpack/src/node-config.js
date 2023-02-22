const nodeExternals = require("webpack-node-externals");
const path = require("path");

const buildDirectory = path.resolve(process.cwd(), "dist");

module.exports = {
  entry: { index: "./index.ts" },
  target: "node",
  mode: "production",

  performance: {
    maxEntrypointSize: 100000,
    hints: "error",
  },

  resolve: {
    extensions: [".ts", ".tsx"],
  },

  output: {
    path: buildDirectory,

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

        options: {
          compilerOptions: {
            declaration: true,
            declarationDir: "./dist",
          },
        },
      },
    ],
  },
};
