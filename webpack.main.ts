import path from "path";
import webpack from "webpack";
import ForkTsCheckerPlugin from "fork-ts-checker-webpack-plugin"
import { isDevelopment, isProduction, mainDir, outDir } from "./src/common/vars";
import nodeExternals from "webpack-node-externals";

export default function (): webpack.Configuration {
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
      path: outDir,
    },
    resolve: {
      extensions: ['.json', '.js', '.ts']
    },
    node: {
      // webpack modifies node internals by default, keep as is for main-process
      __dirname: false,
      __filename: false,
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
      new ForkTsCheckerPlugin(),
    ]
  }
}
