/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import nodeExternals from "webpack-node-externals";
import { platform } from "os";
import path from "path";
import { DefinePlugin, optimize } from "webpack";
import { main, renderer } from "./library";
import { buildDir } from "./vars";

const config = [
  {
    ...main,
    entry: {
      main: path.resolve(__dirname, "..", "src", "main", "library.ts"),
    },
    output: {
      libraryTarget: "commonjs",
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
    ],
  },
  {
    ...renderer,
    entry: {
      renderer: path.resolve(__dirname, "..", "src", "renderer", "library.ts"),
    },
    output: {
      libraryTarget: "commonjs",
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
    ],
  },
];

export default config;
