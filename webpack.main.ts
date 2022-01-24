/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import path from "path";
import type webpack from "webpack";
import ForkTsCheckerPlugin from "fork-ts-checker-webpack-plugin";
import nodeExternals from "webpack-node-externals";
import * as vars from "./src/common/vars";
import getTSLoader from "./src/common/getTSLoader";
import CircularDependencyPlugin from "circular-dependency-plugin";

const configs: { (): webpack.Configuration }[] = [];

configs.push((): webpack.Configuration => {
  console.info("WEBPACK:main", vars);
  const { isProduction, mainDir, buildDir, isDevelopment } = vars;

  return {
    context: __dirname,
    target: "electron-main",
    mode: isProduction ? "production" : "development",
    devtool: isDevelopment ? "hidden-source-map" : "source-map",
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
        getTSLoader({}, /\.ts$/),
      ],
    },
    plugins: [
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
