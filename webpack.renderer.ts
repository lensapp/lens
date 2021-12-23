/**
 * Copyright (c) 2021 OpenLens Authors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import * as vars from "./src/common/vars";
import { appName, buildDir, htmlTemplate, isDevelopment, isProduction, publicPath, rendererDir, sassCommonVars, webpackDevServerPort } from "./src/common/vars";
import path from "path";
import webpack from "webpack";
import HtmlWebpackPlugin from "html-webpack-plugin";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import ForkTsCheckerPlugin from "fork-ts-checker-webpack-plugin";
import ProgressBarPlugin from "progress-bar-webpack-plugin";
import ReactRefreshWebpackPlugin from "@pmmmwh/react-refresh-webpack-plugin";
import MonacoWebpackPlugin from "monaco-editor-webpack-plugin";
import getTSLoader from "./src/common/getTSLoader";

export default [
  webpackLensRenderer,
];

export function webpackLensRenderer({ showVars = true } = {}): webpack.Configuration {
  if (showVars) {
    console.info("WEBPACK:renderer", vars);
  }

  return {
    context: __dirname,
    target: "electron-renderer",
    devtool: isDevelopment ? "cheap-source-map" : "source-map",
    devServer: {
      contentBase: buildDir,
      port: webpackDevServerPort,
      host: "localhost",
      hot: true,
      // to avoid cors errors when requests is from iframes
      disableHostCheck: true,
      headers: { "Access-Control-Allow-Origin": "*" },
    },
    name: "lens-app",
    mode: isProduction ? "production" : "development",
    cache: isDevelopment,
    entry: {
      [appName]: path.resolve(rendererDir, "bootstrap.tsx"),
    },
    output: {
      libraryTarget: "global",
      library: "",
      globalObject: "this",
      publicPath,
      path: buildDir,
      filename: "[name].js",
      chunkFilename: "chunks/[name].js",
    },
    stats: {
      warningsFilter: [
        /Critical dependency: the request of a dependency is an expression/,
        /export '.*' was not found in/,
      ],
    },
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
        getTSLoader(/\.tsx?$/),
        {
          test: /\.(jpg|png|svg|map|ico)$/,
          use: {
            loader: "file-loader",
            options: {
              name: "images/[name]-[hash:6].[ext]",
              esModule: false, // handle media imports in <template>, e.g <img src="../assets/logo.svg"> (vue/react?)
            },
          },
        },
        {
          test: /\.(ttf|eot|woff2?)$/,
          use: {
            loader: "url-loader",
            options: {
              name: "fonts/[name].[ext]",
            },
          },
        },
        {
          test: /\.s?css$/,
          use: [
            isDevelopment ? "style-loader" : MiniCssExtractPlugin.loader,
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
        },
      ],
    },

    plugins: [
      new ProgressBarPlugin(),
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
      }),

      new MiniCssExtractPlugin({
        filename: "[name].css",
      }),

      isDevelopment && new webpack.HotModuleReplacementPlugin(),
      isDevelopment && new ReactRefreshWebpackPlugin(),
    ].filter(Boolean),
  };
}
