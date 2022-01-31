/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import * as vars from "./src/common/vars";
import path from "path";
import type webpack from "webpack";
import HtmlWebpackPlugin from "html-webpack-plugin";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import ForkTsCheckerPlugin from "fork-ts-checker-webpack-plugin";
import MonacoWebpackPlugin from "monaco-editor-webpack-plugin";
import getTSLoader from "./src/common/getTSLoader";
import CircularDependencyPlugin from "circular-dependency-plugin";

export function webpackLensRenderer(): webpack.Configuration {
  console.info("WEBPACK:renderer", vars);

  const {
    appName,
    buildDir,
    htmlTemplate,
    isDevelopment,
    publicPath,
    rendererDir,
  } = vars;

  return {
    context: __dirname,
    target: "electron-renderer",
    name: "lens-app",
    mode: isDevelopment ? "development" : "production",
    devtool: isDevelopment ? "cheap-module-source-map" : "source-map",
    cache: isDevelopment,
    entry: {
      [appName]: path.resolve(rendererDir, "bootstrap.tsx"),
    },
    output: {
      libraryTarget: "global",
      globalObject: "this",
      publicPath,
      path: buildDir,
      filename: "[name].js",
      chunkFilename: "chunks/[name].js",
      assetModuleFilename: "assets/[name][ext][query]",
    },
    ignoreWarnings: [
      /Critical dependency: the request of a dependency is an expression/,
      /export '.*' was not found in/,
    ],
    resolve: {
      extensions: [
        ".js", ".jsx", ".json",
        ".ts", ".tsx",
      ],
    },
    externals: {
      "node-fetch": "commonjs node-fetch",
    },
    optimization: {
      minimize: false,
    },
    module: {
      rules: [
        {
          test: /\.node$/,
          use: "node-loader",
        },
        getTSLoader(),
        cssModulesWebpackRule(),
        filesAndIconsWebpackRule(),
        fontsLoaderWebpackRule(),
        {
          // Allows to import/require() resource as plain text with suffix `?raw`
          // To make it work must be listed in the end of `config.module.rules`
          resourceQuery: /raw/,
          type: "asset/source",
        },
      ],
    },

    plugins: [
      new ForkTsCheckerPlugin(),

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
      }),

      new CircularDependencyPlugin({
        cwd: __dirname,
        exclude: /node_modules/,
        failOnError: true,
      }),

      new MiniCssExtractPlugin({
        filename: "[name].css",
      }),
    ].filter(Boolean),
  };
}

/**
 * Import content of svg-icons, images and text files
 */
export function filesAndIconsWebpackRule(): webpack.RuleSetRule {
  return {
    test: /\.(jpg|png|svg|map|ico)$/,
    type: "asset/resource", // https://webpack.js.org/guides/asset-modules/
  };
}

/**
 * Import custom fonts as URL
 */
export function fontsLoaderWebpackRule(): webpack.RuleSetRule {
  return {
    test: /\.(ttf|eot|woff2?)$/,
    type: "asset/resource",
  };
}

/**
 * Import CSS or SASS styles with modules support (*.module.scss)
 * @param {string} styleLoader
 */
export function cssModulesWebpackRule(
  {
    styleLoader = vars.isDevelopment ? "style-loader" : MiniCssExtractPlugin.loader,
  } = {}): webpack.RuleSetRule {
  const { /*isDevelopment,*/ sassCommonVars } = vars;

  return {
    test: /\.s?css$/,
    use: [
      styleLoader,
      {
        loader: "css-loader",
        options: {
          // sourceMap: isDevelopment,
          modules: {
            auto: /\.module\./i, // https://github.com/webpack-contrib/css-loader#auto
            mode: "local", // :local(.selector) by default
            localIdentName: "[name]__[local]--[hash:base64:5]",
          },
        },
      },
      {
        loader: "postcss-loader",
        options: {
          // sourceMap: isDevelopment,
          postcssOptions: {
            plugins: [
              "tailwindcss",
            ],
          },
        },
      },
      {
        loader: "sass-loader",
        options: {
          // sourceMap: isDevelopment,
          additionalData: `@import "${path.basename(sassCommonVars)}";`,
          sassOptions: {
            includePaths: [
              path.dirname(sassCommonVars),
            ],
          },
        },
      },
    ],
  };
}

export default [
  webpackLensRenderer,
];
