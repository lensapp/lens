/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import path from "path";
import type webpack from "webpack";
import type { WebpackPluginInstance } from "webpack";
import { DefinePlugin } from "webpack";
import nodeExternals from "webpack-node-externals";
import ForkTsCheckerPlugin from "fork-ts-checker-webpack-plugin";
import CircularDependencyPlugin from "circular-dependency-plugin";
import MonacoWebpackPlugin from "monaco-editor-webpack-plugin";
import getTypeScriptLoader from "./get-typescript-loader";
import rendererConfig, { iconsAndImagesWebpackRules } from "./renderer";
import { appName, assetsFolderName, buildDir, htmlTemplate, isDevelopment, mainDir, publicPath } from "./vars";
import { platform } from "process";
import HtmlWebpackPlugin from "html-webpack-plugin";
import MiniCssExtractPlugin from "mini-css-extract-plugin";

const renderer: webpack.Configuration = ({
  ...rendererConfig({ showVars: false }),
  plugins: [
    // see also: https://github.com/Microsoft/monaco-editor-webpack-plugin#options
    new MonacoWebpackPlugin({
      // publicPath: "/",
      // filename: "[name].worker.js",
      languages: ["json", "yaml"],
      globalAPI: isDevelopment,
    }),
    new HtmlWebpackPlugin({
      filename: `${appName}.html`,
      template: htmlTemplate,
      inject: true,
      hash: true,
      templateParameters: {
        assetPath: `${publicPath}${assetsFolderName}`,
      },
    }),
    new MiniCssExtractPlugin({
      filename: "[name].css",
    }),
  ],
});

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
      getTypeScriptLoader({}, /\.ts$/),
      ...iconsAndImagesWebpackRules(),
    ],
  },
  plugins: [
    new DefinePlugin({
      CONTEXT_MATCHER_FOR_NON_FEATURES: `/\\.injectable(\\.${platform})?\\.tsx?$/`,
      CONTEXT_MATCHER_FOR_FEATURES: `/\\/(main|common)\\/.+\\.injectable(\\.${platform})?\\.tsx?$/`,
    }),
    new ForkTsCheckerPlugin(),
    new CircularDependencyPlugin({
      cwd: __dirname,
      exclude: /node_modules/,
      failOnError: true,
    }) as unknown as WebpackPluginInstance,
  ],
});

export {
  main,
  renderer,
};
