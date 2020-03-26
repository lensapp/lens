import * as path from "path";
import * as webpack from "webpack";
import * as HtmlWebpackPlugin from "html-webpack-plugin";
import * as MiniCssExtractPlugin from "mini-css-extract-plugin";
import * as TerserWebpackPlugin from "terser-webpack-plugin";
import { BUILD_DIR, CLIENT_DIR, clientVars, config } from "./server/config"

export default () => {
  const { IS_PRODUCTION } = config;
  const srcDir = path.resolve(process.cwd(), CLIENT_DIR);
  const buildDir = path.resolve(process.cwd(), BUILD_DIR, CLIENT_DIR);
  const tsConfigClientFile = path.resolve(srcDir, "tsconfig.json");
  const sassCommonVarsFile = "./components/vars.scss"; // needs to be relative for Windows

  return {
    entry: {
      app: path.resolve(srcDir, "components/app.tsx"),
    },
    output: {
      path: buildDir,
      publicPath: '/',
      filename: '[name].js',
      chunkFilename: 'chunks/[name].js',
    },
    resolve: {
      extensions: ['.ts', '.tsx', '.js', '.json']
    },

    mode: IS_PRODUCTION ? "production" : "development",
    devtool: IS_PRODUCTION ? "" : "cheap-module-eval-source-map",

    optimization: {
      minimize: IS_PRODUCTION,
      minimizer: [
        ...(!IS_PRODUCTION ? [] : [
          new TerserWebpackPlugin({
            cache: true,
            parallel: true,
            terserOptions: {
              mangle: true,
              compress: true,
              keep_classnames: true,
              keep_fnames: true,
            },
            extractComments: {
              condition: "some",
              banner: [
                `Lens. Copyright ${new Date().getFullYear()} by Lakend Labs, Inc. All rights reserved.`
              ].join("\n")
            }
          })
        ]),
      ],
      splitChunks: {
        cacheGroups: {
          commons: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all'
          }
        }
      }
    },

    module: {
      rules: [
        {
          test: /\.tsx?$/,
          exclude: /node_modules/,
          use: [
            "babel-loader",
            {
              loader: 'ts-loader',
              options: {
                configFile: tsConfigClientFile
              }
            }
          ]
        },
        {
          test: /\.(jpg|png|svg|map|ico)$/,
          use: 'file-loader?name=assets/[name]-[hash:6].[ext]'
        },
        {
          test: /\.(ttf|eot|woff2?)$/,
          use: 'file-loader?name=fonts/[name].[ext]'
        },
        {
          test: /\.ya?ml$/,
          use: "yml-loader"
        },
        {
          test: /\.s?css$/,
          use: [
            IS_PRODUCTION ? MiniCssExtractPlugin.loader : {
              loader: "style-loader",
              options: {}
            },
            {
              loader: "css-loader",
              options: {
                sourceMap: !IS_PRODUCTION
              },
            },
            {
              loader: "sass-loader",
              options: {
                sourceMap: !IS_PRODUCTION,
                prependData: '@import "' + sassCommonVarsFile + '";',
                sassOptions: {
                  includePaths: [srcDir]
                },
              }
            },
          ]
        }
      ]
    },

    plugins: [
      ...(IS_PRODUCTION ? [] : [
        new webpack.HotModuleReplacementPlugin(),
      ]),

      new webpack.DefinePlugin({
        process: {
          env: JSON.stringify(clientVars)
        },
      }),

      // don't include all moment.js locales by default
      new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),

      new HtmlWebpackPlugin({
        template: 'index.html',
        inject: true,
        hash: true,
      }),
      new MiniCssExtractPlugin({
        filename: "[name].css",
      }),
    ],
  }
};
