/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */


import path from "path";
import type webpack from "webpack";
import * as vars from "./src/common/vars";
import { cssModulesWebpackRule, fontsLoaderWebpackRules, iconsAndImagesWebpackRules } from "./webpack.renderer";

export default function generateExtensionTypes(): webpack.Configuration {
  const { isDevelopment } = vars;
  const entry = "./src/extensions/extension-api.ts";
  const outDir = "./src/extensions/npm/extensions/dist";

  return {
    // Compile for Electron for renderer process
    // see <https://webpack.js.org/configuration/target/>
    target: "electron-renderer",
    entry,
    // this is the default mode, so we should make it explicit to silence the warning
    mode: isDevelopment ? "development" : "production",
    output: {
      filename: "extension-api.js",
      // need to be an absolute path
      path: path.resolve(__dirname, `${outDir}/src/extensions`),
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
              outDir, // where the .d.ts should be located
            },
          },
        },
        cssModulesWebpackRule({ styleLoader: "style-loader" }),
        ...fontsLoaderWebpackRules(),
        ...iconsAndImagesWebpackRules(),
      ],
    },
    resolve: {
      extensions: [".ts", ".tsx", ".js"],
    },
    plugins: [
      // In ts-loader's README they said to output a built .d.ts file,
      // you can set "declaration": true in tsconfig.extensions.json,
      // and use the DeclarationBundlerPlugin in your webpack config... but
      // !! the DeclarationBundlerPlugin doesn't work anymore, author archived it.
      // https://www.npmjs.com/package/declaration-bundler-webpack-plugin
      // new DeclarationBundlerPlugin({
      //   moduleName: '@k8slens/extensions',
      //    out: 'extension-api.d.ts',
      // })
    ],
  };
}
