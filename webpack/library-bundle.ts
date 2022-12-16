/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import nodeExternals from "webpack-node-externals";
import { platform } from "os";
import path from "path";
import type { WebpackPluginInstance } from "webpack";
import { DefinePlugin, optimize } from "webpack";
import { main, renderer } from "./library";
import { buildDir } from "./vars";
import CircularDependencyPlugin from "circular-dependency-plugin";
import ForkTsCheckerPlugin from "fork-ts-checker-webpack-plugin";

const config = [
  {
    ...main,
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
  },
  {
    ...renderer,
    entry: {
      common: path.resolve(__dirname, "..", "src", "common", "library.ts"),
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
    externals: [
      nodeExternals(),
    ],
    plugins: [
      new ForkTsCheckerPlugin(),
      new CircularDependencyPlugin({
        cwd: __dirname,
        exclude: /node_modules/,
        failOnError: true,
      }) as unknown as WebpackPluginInstance,
    ],
  },
  {
    ...renderer,
    name: "lens-app-common",
    entry: {
      renderer: path.resolve(__dirname, "..", "src", "renderer", "library.ts"),
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
    externals: [
      nodeExternals(),
    ],
    plugins: [
      new DefinePlugin({
        CONTEXT_MATCHER_FOR_NON_FEATURES: `/\\.injectable(\\.${platform})?\\.tsx?$/`,
        CONTEXT_MATCHER_FOR_FEATURES: `/\\/(renderer|common)\\/.+\\.injectable(\\.${platform})?\\.tsx?$/`,
      }),
      new MiniCssExtractPlugin({
        filename: "[name].css",
        runtime: false,
      }),
      new optimize.LimitChunkCountPlugin({
        maxChunks: 1,
      }),
      new ForkTsCheckerPlugin(),
      new CircularDependencyPlugin({
        cwd: __dirname,
        exclude: /node_modules/,
        failOnError: true,
      }) as unknown as WebpackPluginInstance,
    ],
  },
];

export default config;
