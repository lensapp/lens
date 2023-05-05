/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import path from "path";
import type webpack from "webpack";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import CircularDependencyPlugin from "circular-dependency-plugin";
import ForkTsCheckerPlugin from "fork-ts-checker-webpack-plugin";
import type { WebpackPluginInstance } from "webpack";
import { optimize, DefinePlugin } from "webpack";
import nodeExternals from "webpack-node-externals";
import { isDevelopment, buildDir, sassCommonVars } from "./vars";

export function webpackLensRenderer(): webpack.Configuration {
  return {
    target: "electron-renderer",
    name: "lens-app-renderer",
    mode: isDevelopment ? "development" : "production",
    // https://webpack.js.org/configuration/devtool/ (see description of each option)
    devtool: isDevelopment ? "cheap-module-source-map" : "source-map",
    cache: isDevelopment ? { type: "filesystem" } : false,
    entry: {
      renderer: path.resolve(__dirname, "..", "src", "renderer", "library.ts"),
    },
    output: {
      library: {
        type: "commonjs2",
      },
      path: path.resolve(buildDir, "library"),
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
    externals: [
      nodeExternals({ modulesFromFile: true }),
    ],
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
          test: (modulePath) => (
            (modulePath.endsWith(".ts") && !modulePath.endsWith(".test.ts"))
            || (modulePath.endsWith(".tsx") && !modulePath.endsWith(".test.tsx"))
          ),
          exclude: /node_modules/,
          use: {
            loader: "ts-loader",
            options: {
              transpileOnly: true,
              compilerOptions: {
                declaration: true,
                sourceMap: false,
              },
            },
          },
        },
        {
          test: /\.(yaml|yml)$/,
          type: "asset/source",
        },
        cssModulesWebpackRule(),
        ...iconsAndImagesWebpackRules(),
        ...fontsLoaderWebpackRules(),
      ],
    },

    plugins: [
      new DefinePlugin({
        CONTEXT_MATCHER_FOR_NON_FEATURES: `/\\.injectable\\.tsx?$/`,
        CONTEXT_MATCHER_FOR_FEATURES: `/\\/(renderer|common)\\/.+\\.injectable\\.tsx?$/`,
      }),
      new ForkTsCheckerPlugin({}),

      new CircularDependencyPlugin({
        cwd: __dirname,
        exclude: /node_modules/,
        failOnError: true,
      }) as unknown as WebpackPluginInstance,

      new MiniCssExtractPlugin({
        filename: "[name].css",
      }),

      new optimize.LimitChunkCountPlugin({
        maxChunks: 1,
      }),
    ],
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
      type: "asset/source", // exports the source code of the asset, so we get XML
    },
    {
      test: /\.(jpg|png|ico)$/,
      type: "asset/resource",
      generator: {
        filename: "images/[name][ext]",
      },
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
      generator: {
        filename: "fonts/[name][ext]",
      },
    },
  ];
}

export interface CssModulesWebpackRuleOptions {
  styleLoader?: string;
}

/**
 * Import CSS or SASS styles with modules support (*.module.scss)
 */
export function cssModulesWebpackRule({ styleLoader }: CssModulesWebpackRuleOptions = {}): webpack.RuleSetRule {
  styleLoader ??= MiniCssExtractPlugin.loader;

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
