/**
 * Copyright (c) 2021 OpenLens Authors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import path from "path";
import type webpack from "webpack";
import ForkTsCheckerPlugin from "fork-ts-checker-webpack-plugin";
import { isProduction, mainDir, buildDir, isDevelopment } from "./src/common/vars";
import nodeExternals from "webpack-node-externals";
import ProgressBarPlugin from "progress-bar-webpack-plugin";
import * as vars from "./src/common/vars";
import getTSLoader from "./src/common/getTSLoader";
import CircularDependencyPlugin from "circular-dependency-plugin";

const configs: { (): webpack.Configuration }[] = [];

configs.push((): webpack.Configuration => {
  console.info("WEBPACK:main", vars);

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
      extensions: [".json", ".js", ".ts"],
    },
    externals: [
      nodeExternals(),
    ],
    module: {
      rules: [
        {
          test: /\.node$/,
          use: "node-loader",
        },
        getTSLoader(/\.ts$/),
      ],
    },
    plugins: [
      new ProgressBarPlugin(),
      new ForkTsCheckerPlugin(),

      new CircularDependencyPlugin({
        cwd: __dirname,
        exclude: /node_modules/,
        failOnError: true,
      }),
    ].filter(Boolean),
  };
});

export default configs;
