import path from "path";
import webpack from "webpack";
import ForkTsCheckerPlugin from "fork-ts-checker-webpack-plugin";
import { isDevelopment, isProduction, mainDir, buildDir } from "./src/common/vars";
import nodeExternals from "webpack-node-externals";
import * as vars from "./src/common/vars";

export default function (): webpack.Configuration {
  console.info("WEBPACK:main", vars);

  return {
    context: __dirname,
    target: "electron-main",
    mode: isProduction ? "production" : "development",
    devtool: isProduction ? "source-map" : "eval-source-map",
    cache: isDevelopment ? {
      type: "filesystem",
      buildDependencies: {
        // Add your config as buildDependency to get cache invalidation on config change
        config: [__filename]
      }
    }: false,
    entry: {
      main: path.resolve(mainDir, "index.ts"),
    },
    output: {
      libraryTarget: "global",
      path: buildDir,
    },
    resolve: {
      extensions: [".json", ".js", ".ts"]
    },
    // in order to ignore built-in modules like path, fs, etc.
    externalsPresets: { node: true },
    // in order to ignore all modules in node_modules folder
    externals: nodeExternals(),
    optimization: {
      minimize: isProduction,
    },
    module: {
      rules: [
        {
          test: /\.node$/,
          use: "node-loader"
        },
        {
          test: /\.ts$/,
          exclude: /node_modules/,
          use: {
            loader: "ts-loader",
            options: {
              transpileOnly: true,
            }
          }
        },
      ]
    },
    plugins: [
      new ForkTsCheckerPlugin(),
      new webpack.ProgressPlugin({ percentBy: "entries" }),
    ]
  };
}
