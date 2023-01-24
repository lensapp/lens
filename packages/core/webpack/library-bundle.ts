/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import { platform } from "os";
import path from "path";
import { DefinePlugin, optimize } from "webpack";
import main from "./main";
import renderer, { iconsAndImagesWebpackRules } from "./renderer";
import { buildDir } from "./vars";

const rendererConfig = renderer({ showVars: false });

const config = [
  {
    ...main(),
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
          test: /\.ts$/,
          exclude: /node_modules/,
          use: {
            loader: "ts-loader",
            options: {
              compilerOptions: {
                declaration: true,
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
        CONTEXT_MATCHER_FOR_NON_FEATURES: `/\\.injectable(\\.${platform})?\\.tsx?$/`,
        CONTEXT_MATCHER_FOR_FEATURES: `/\\/(main|common)\\/.+\\.injectable(\\.${platform})?\\.tsx?$/`,
      }),
    ],
  },
  {
    ...main(),
    name: "lens-app-common",
    entry: {
      common: path.resolve(__dirname, "..", "src", "common", "library.ts"),
    },
    output: {
      publicPath: "",
      library: {
        type: "commonjs2",
      },
      path: path.resolve(buildDir, "library"),
    },
    optimization: {
      minimize: false,
    },
    plugins: [],
  },
  {
    ...rendererConfig,
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
      ...(rendererConfig.externals as any).filter(Boolean),
      {
        "monaco-editor": "commonjs monaco-editor",
      },
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
