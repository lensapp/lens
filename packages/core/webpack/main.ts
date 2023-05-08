/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import path from "path";
import type webpack from "webpack";
import nodeExternals from "webpack-node-externals";
import ForkTsCheckerPlugin from "fork-ts-checker-webpack-plugin";
import { iconsAndImagesWebpackRules } from "./renderer";
import { DefinePlugin } from "webpack";
import { buildDir, isDevelopment } from "./vars";

const webpackLensMain = (): webpack.Configuration => {
  return {
    name: "lens-app-main",
    context: __dirname,
    target: "electron-main",
    mode: isDevelopment ? "development" : "production",
    devtool: isDevelopment ? "cheap-module-source-map" : "source-map",
    cache: isDevelopment ? { type: "filesystem" } : false,
    entry: {
      main: path.resolve(__dirname, "..", "src", "main", "library.ts"),
    },
    output: {
      library: {
        type: "commonjs2",
      },
      path: path.resolve(buildDir, "library"),
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
          test: (modulePath) => modulePath.endsWith(".ts") && !modulePath.endsWith(".test.ts"),
          exclude: /node_modules/,
          use: {
            loader: "ts-loader",
            options: {
              transpileOnly: true,
              compilerOptions: {
                sourceMap: false,
              },
            },
          },
        },
        ...iconsAndImagesWebpackRules(),
      ],
    },
    plugins: [
      new DefinePlugin({
        CONTEXT_MATCHER_FOR_NON_FEATURES: `/\\.injectable\\.tsx?$/`,
        CONTEXT_MATCHER_FOR_FEATURES: `/\\/(main|common)\\/.+\\.injectable\\.tsx?$/`,
      }),
      new ForkTsCheckerPlugin({
        typescript: {
          mode: "write-dts",
          configOverwrite: {
            compilerOptions: {
              declaration: true,
            },
          },
        },
      }),
    ],
  };
};

export default webpackLensMain;
