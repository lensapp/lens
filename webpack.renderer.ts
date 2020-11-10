import { appName, buildDir, htmlTemplate, isDevelopment, isProduction, publicPath, rendererDir, sassCommonVars, webpackDevServerPort } from "./src/common/vars";
import path from "path";
import webpack from "webpack";
import HtmlWebpackPlugin from "html-webpack-plugin";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import TerserPlugin from "terser-webpack-plugin";
import ForkTsCheckerPlugin from "fork-ts-checker-webpack-plugin"
import ProgressBarPlugin from "progress-bar-webpack-plugin";
import ReactRefreshWebpackPlugin from '@pmmmwh/react-refresh-webpack-plugin'

export default [
  webpackLensRenderer
]

export function webpackLensRenderer({ showVars = true } = {}): webpack.Configuration {
  if (showVars) {
    console.info('WEBPACK:renderer', require("./src/common/vars"));
  }
  return {
    context: __dirname,
    target: "electron-renderer",
    devtool: "source-map", // todo: optimize in dev-mode with webpack.SourceMapDevToolPlugin
    devServer: {
      contentBase: buildDir,
      port: webpackDevServerPort,
      host: "localhost",
      hot: true,
      // to avoid cors errors when requests is from iframes
      disableHostCheck: true,
      headers: { 'Access-Control-Allow-Origin': '*' },
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
      publicPath: publicPath,
      path: buildDir,
      filename: '[name].js',
      chunkFilename: 'chunks/[name].js',
    },
    stats: {
      warningsFilter: [
        /Critical dependency: the request of a dependency is an expression/
      ]
    },
    resolve: {
      extensions: [
        '.js', '.jsx', '.json',
        '.ts', '.tsx',
      ]
    },
    optimization: {
      minimize: isProduction,
      minimizer: [
        new TerserPlugin({
          cache: true,
          parallel: true,
          sourceMap: true,
          extractComments: {
            condition: "some",
            banner: [
              `Lens - The Kubernetes IDE. Copyright ${new Date().getFullYear()} by Mirantis, Inc. All rights reserved.`
            ].join("\n")
          }
        })
      ],
    },

    module: {
      rules: [
        {
          test: /\.node$/,
          use: "node-loader"
        },
        {
          test: /\.tsx?$/,
          exclude: /node_modules/,
          use: [
            {
              loader: "babel-loader",
              options: {
                presets: [
                  ["@babel/preset-env", {
                    modules: "commonjs" // ling-ui
                  }],
                ],
                plugins: [
                  isDevelopment && require.resolve('react-refresh/babel'),
                ].filter(Boolean),
              }
            },
            {
              loader: "ts-loader",
              options: {
                transpileOnly: true,
                compilerOptions: {
                  // localization support
                  // https://lingui.js.org/guides/typescript.html
                  jsx: "preserve",
                  target: "es2016",
                  module: "esnext",
                },
              }
            }
          ]
        },
        {
          test: /\.(jpg|png|svg|map|ico)$/,
          use: {
            loader: "file-loader",
            options: {
              name: "images/[name]-[hash:6].[ext]",
              esModule: false, // handle media imports in <template>, e.g <img src="../assets/logo.svg"> (vue/react?)
            }
          }
        },
        {
          test: /\.(ttf|eot|woff2?)$/,
          use: {
            loader: "url-loader",
            options: {
              name: "fonts/[name].[ext]"
            }
          }
        },
        {
          test: /\.s?css$/,
          use: [
            // https://webpack.js.org/plugins/mini-css-extract-plugin/
            isDevelopment ? "style-loader" : MiniCssExtractPlugin.loader,
            {
              loader: "css-loader",
              options: {
                sourceMap: isDevelopment
              },
            },
            {
              loader: "sass-loader",
              options: {
                sourceMap: isDevelopment,
                prependData: `@import "${path.basename(sassCommonVars)}";`,
                sassOptions: {
                  includePaths: [
                    path.dirname(sassCommonVars)
                  ]
                },
              }
            },
          ]
        }
      ]
    },

    plugins: [
      new ProgressBarPlugin(),
      new ForkTsCheckerPlugin(),

      // todo: fix remain warnings about circular dependencies
      // new CircularDependencyPlugin({
      //   cwd: __dirname,
      //   exclude: /node_modules/,
      //   allowAsyncCycles: true,
      //   failOnError: false,
      // }),

      // todo: check if this actually works in mode=production files
      // new webpack.DllReferencePlugin({
      //   context: process.cwd(),
      //   manifest: manifestPath,
      //   sourceType: libraryTarget,
      // }),

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
  }
}
