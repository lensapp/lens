import path from "path";
import webpack from "webpack";
import ForkTsCheckerPlugin from "fork-ts-checker-webpack-plugin"
import { isDevelopment, isProduction, mainDir, buildDir } from "./src/common/vars";
import nodeExternals from "webpack-node-externals";
import ProgressBarPlugin from "progress-bar-webpack-plugin";

export default function (): webpack.Configuration {
  console.info('WEBPACK:main', require("./src/common/vars"))
  return {
    context: __dirname,
    target: "electron-main",
    mode: isProduction ? "production" : "development",
    devtool: isProduction ? "source-map" : "cheap-eval-source-map",
    cache: isDevelopment,
    entry: {
      main: path.resolve(mainDir, "index.ts"),
    },
    output: {
      libraryTarget: "global",
      path: buildDir,
    },
    resolve: {
      extensions: ['.json', '.js', '.ts']
    },
    externals: [
      nodeExternals()
    ],
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
      new ProgressBarPlugin(),
      new ForkTsCheckerPlugin(),
    ].filter(Boolean)
  }
}
