/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */


import path from "path";
import type webpack from "webpack";

const isDevelopment = process.env.NODE_ENV !== "production";

export default function generateExtensionTypes(): webpack.Configuration {
  return {
    // Compile for Electron for renderer process
    // see <https://webpack.js.org/configuration/target/>
    target: "electron-renderer",
    entry: "./src/extension-api.ts",
    // this is the default mode, so we should make it explicit to silence the warning
    mode: isDevelopment ? "development" : "production",
    output: {
      filename: "extension-api.js",
      // need to be an absolute path
      path: path.resolve("./dist/"),
      // can be use in commonjs environments
      // e.g. require('@k8slens/extensions')
      libraryTarget: "commonjs",
    },
    cache: isDevelopment,
    optimization: {
      minimize: false, // speed up types compilation
    },
    ignoreWarnings: [
      /Critical dependency: the request of a dependency is an expression/, // see who is using request: "npm ls request"
      /require.extensions is not supported by webpack./, // handlebars
    ],
    stats: "errors-warnings",
    externals: [
      "@k8slens/core/common",
      "@k8slens/core/main",
      "@k8slens/core/renderer",
    ],
    module: {
      rules: [
        {
          test: /\.node$/,
          loader: "ignore-loader",
        },
        {
          test: /\.tsx?$/,
          loader: "ts-loader",
          options: {
            // !! ts-loader will use tsconfig.json at folder root
            // !! changes in tsconfig.json may have side effects
            // !! on '@k8slens/extensions' module
            compilerOptions: {
              declaration: true, // output .d.ts
              sourceMap: false, // to override sourceMap: true in tsconfig.json
              outDir: path.resolve("./dist/"), // where the .d.ts should be located
            },
          },
        },
      ],
    },
    resolve: {
      extensions: [".ts", ".tsx", ".js"],
    },
    plugins: [],
  };
}
