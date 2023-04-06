import path from "path";
import type webpack from "webpack";
import { DefinePlugin } from "webpack";
import nodeExternals from "webpack-node-externals";
import { iconsAndImagesWebpackRules } from "./renderer";
import { buildDir, isDevelopment, mainDir } from "./vars";
import { platform } from "process";

const main: webpack.Configuration = ({
  name: "lens-app-main",
  context: __dirname,
  target: "electron-main",
  mode: isDevelopment ? "development" : "production",
  devtool: isDevelopment ? "cheap-module-source-map" : "source-map",
  cache: isDevelopment ? { type: "filesystem" } : false,
  entry: {
    main: path.resolve(mainDir, "index.ts"),
  },
  output: {
    libraryTarget: "global",
    path: buildDir,
  },
  optimization: {
    minimize: false,
  },
  resolve: {
    extensions: [".json", ".js", ".ts"],
  },
  externals: [
    nodeExternals({ modulesFromFile: true }),
  ],
  module: {
    parser: {
      javascript: {
        commonjsMagicComments: true,
      },
    },
    rules: [
      {
        test: /\.node$/,
        use: "node-loader",
      },
      {
        test: /\.ts$/,
        loader: "ts-loader",
        options: {},
       },
      ...iconsAndImagesWebpackRules(),
    ],
  },
  plugins: [
    new DefinePlugin({
      CONTEXT_MATCHER_FOR_NON_FEATURES: `/\\.injectable\\.tsx?$/`,
      CONTEXT_MATCHER_FOR_FEATURES: `/\\/(renderer|common)\\/.+\\.injectable\\.tsx?$/`,
    }),
  ],
});

export default main;
