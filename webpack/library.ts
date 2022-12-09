/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import path from "path";
import type webpack from "webpack";
import { DefinePlugin } from "webpack";
import nodeExternals from "webpack-node-externals";
import getTypeScriptLoader from "./get-typescript-loader";
import rendererConfig, { iconsAndImagesWebpackRules } from "./renderer";
import { buildDir, isDevelopment, mainDir } from "./vars";
import { platform } from "process";

const configs: { (): webpack.Configuration }[] = [
  rendererConfig,
];

configs.push((): webpack.Configuration => {
  console.info("WEBPACK:library", {
    isDevelopment,
    buildDir,
  });

  return {
    name: "lens-app-library",
    context: __dirname,
    target: "electron-main",
    mode: isDevelopment ? "development" : "production",
    devtool: isDevelopment ? "cheap-module-source-map" : "source-map",
    cache: isDevelopment ? { type: "filesystem" } : false,
    entry: {
      library: path.resolve(mainDir, "..", "library.ts"),
    },
    output: {
      path: path.join(buildDir, "library"),
      library: {
        type: "commonjs",
      },
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
        {
          test: /\.tsx?$/,
          loader: "ts-loader",
          options: {
            compilerOptions: {
              declaration: true, // output .d.ts
              sourceMap: false, // to override sourceMap: true in tsconfig.json
              outDir: path.join(buildDir, "library"),
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
  };
});

configs.push((): webpack.Configuration => {
  console.info("WEBPACK:library:download-binaries", {
    isDevelopment,
    buildDir,
  });

  return {
    name: "lens-app-library-download-binaries",
    context: __dirname,
    target: "electron-main",
    mode: isDevelopment ? "development" : "production",
    devtool: false,
    cache: isDevelopment ? { type: "filesystem" } : false,
    entry: {
      download_binaries: path.resolve(process.cwd(), "build", "download_binaries.ts"),
    },
    output: {
      path: path.join(buildDir, "library"),
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
    ],
  };
});

export default configs;
