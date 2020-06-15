import path from "path";
import webpack from "webpack";
import ForkTsCheckerPlugin from "fork-ts-checker-webpack-plugin"
import { isDevelopment, isProduction, mainDir, outDir } from "./src/common/vars";

export default function (): webpack.Configuration {
  return {
    context: __dirname,
    target: "electron-main",
    mode: isProduction ? "production" : "development",
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
    externals: [
      "@kubernetes/client-node",
      "handlebars",
      "node-pty",
      "ws",
    ],
    module: {
      rules: [
        {
          test: /\.node$/,
          use: "node-loader"
        },
        {
          test: /\.ts?$/,
          use: {
            loader: "ts-loader",
            options: {
              transpileOnly: true,
            }
          },
        },
      ]
    },
    plugins: [
      new ForkTsCheckerPlugin(),
    ]
  }
}
