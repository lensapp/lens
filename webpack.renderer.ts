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
import ReactRefreshWebpackPlugin from "@pmmmwh/react-refresh-webpack-plugin";

export function webpackLensRenderer({ showVars = true } = {}): webpack.Configuration {
  if (showVars) {
    console.info("WEBPACK:renderer", vars);
  }

  const assetsFolderName = "assets";
  const { appName, buildDir, htmlTemplate, isDevelopment, publicPath, rendererDir } = vars;

  return {
    target: "electron-renderer",
    name: "lens-app",
    mode: isDevelopment ? "development" : "production",
    // https://webpack.js.org/configuration/devtool/ (see description of each option)
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
      assetModuleFilename: `${assetsFolderName}/[name][ext][query]`,
    },
    watchOptions: {
      ignored: /node_modules/, // https://webpack.js.org/configuration/watch/
    },
    ignoreWarnings: [
      /Critical dependency: the request of a dependency is an expression/,
      /require.extensions is not supported by webpack./, // handlebars
      /\[ReactRefreshPlugin] .*?HMR.*? is not enabled/, // enabled in webpack.dev-server
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
        getTSLoader({
          getCustomTransformers: () => ({
            before: isDevelopment ? [require("react-refresh-typescript")()] : [],
          }),
        }),
        cssModulesWebpackRule(),
        ...iconsAndImagesWebpackRules(),
        ...fontsLoaderWebpackRules(),
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
        templateParameters: {
          assetPath: `${publicPath}${assetsFolderName}`,
        },
      }),

      new CircularDependencyPlugin({
        cwd: __dirname,
        exclude: /node_modules/,
        failOnError: true,
      }),

      new MiniCssExtractPlugin({
        filename: "[name].css",
      }),

      isDevelopment && new ReactRefreshWebpackPlugin(),
    ].filter(Boolean),
  };
}

/**
 * Import icons and image files.
 * Read more about asset types: https://webpack.js.org/guides/asset-modules/
 */
export function iconsAndImagesWebpackRules(): webpack.RuleSetRule[] {
  return [
    {
      test: /\.svg$/,
      type: "asset/inline", // data:image/svg+xml;base64,...
    },
    {
      test: /\.(jpg|png|ico)$/,
      type: "asset/resource", // path to file, e.g. "/static/build/assets/*"
    },
  ];
}

/**
 * Import custom fonts as URL.
 */
export function fontsLoaderWebpackRules(): webpack.RuleSetRule[] {
  return [
    {
      test: /\.(ttf|eot|woff2?)$/,
      type: "asset/resource",
    },
  ];
}

/**
 * Import CSS or SASS styles with modules support (*.module.scss)
 * @param {string} styleLoader
 */
export function cssModulesWebpackRule(
  {
    styleLoader = vars.isDevelopment ? "style-loader" : MiniCssExtractPlugin.loader,
  } = {}): webpack.RuleSetRule {
  const { isDevelopment, sassCommonVars } = vars;

  return {
    test: /\.s?css$/,
    use: [
      styleLoader,
      {
        loader: "css-loader",
        options: {
          sourceMap: isDevelopment,
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
          sourceMap: isDevelopment,
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
          sourceMap: isDevelopment,
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

export default webpackLensRenderer;
