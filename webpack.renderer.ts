import path from "path";
import webpack from "webpack";
import HtmlWebpackPlugin from "html-webpack-plugin";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import TerserPlugin from "terser-webpack-plugin";
import ForkTsCheckerPlugin from "fork-ts-checker-webpack-plugin"
import { VueLoaderPlugin } from "vue-loader"
import { htmlTemplate, isDevelopment, isProduction, outDir, rendererDir, sassCommonVars } from "./src/common/vars";

export default [
  webpackConfigReact,
  webpackConfigVue,
];

export function webpackConfigReact(): webpack.Configuration {
  return {
    context: __dirname,
    target: "electron-renderer",
    devtool: "source-map",
    mode: isProduction ? "production" : "development",
    cache: isDevelopment,
    entry: {
      renderer: path.resolve(rendererDir, "components/app.tsx"),
    },
    output: {
      path: outDir,
      filename: '[name].js',
      chunkFilename: 'chunks/[name].js',
    },
    resolve: {
      extensions: [
        '.js', '.jsx', '.json',
        '.ts', '.tsx',
      ]
    },
    optimization: {
      minimize: false,
      minimizer: [
        new TerserPlugin({
          cache: true,
          parallel: true,
          sourceMap: true,
          extractComments: {
            condition: "some",
            banner: [
              `Lens - The Kubernetes IDE. Copyright ${new Date().getFullYear()} by Lakend Labs, Inc. All rights reserved.`
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
            "babel-loader",
            {
              loader: "ts-loader",
              options: {
                transpileOnly: false, // fixme: enable types resolution with ts-fork-checker
                compilerOptions: {
                  // localization support
                  // https://lingui.js.org/guides/typescript.html
                  jsx: "preserve",
                  target: "es2016",
                },
              }
            }
          ]
        },
        {
          test: /\.(jpg|png|svg|map|ico)$/,
          use: "file-loader?name=images/[name]-[hash:6].[ext]"
        },
        {
          test: /\.(ttf|eot|woff2?)$/,
          use: "file-loader?name=fonts/[name].[ext]"
        },
        {
          test: /\.s?css$/,
          use: [
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
      // fixme: enable with transpileOnly=true
      // new ForkTsCheckerPlugin(),

      // todo: check if this actually works in mode=production files
      // new webpack.DllReferencePlugin({
      //   context: process.cwd(),
      //   manifest: manifestPath,
      //   sourceType: libraryTarget,
      // }),

      new MiniCssExtractPlugin({
        filename: "[name].css",
      }),
    ],
  }
}

export function webpackConfigVue(): webpack.Configuration {
  const config = webpackConfigReact();

  config.resolve.extensions.push(".vue");

  config.resolve.alias = {
    "@": rendererDir,
    "vue$": "vue/dist/vue.esm.js",
    "vue-router$": "vue-router/dist/vue-router.esm.js",
  }

  config.entry = {
    renderer_vue: path.resolve(rendererDir, "_vue/index.js")
  }

  // rules and loaders
  config.module.rules = config.module.rules
    .filter(({ test }: { test: RegExp }) => !test.test(".ts"))
    .filter(({ test }: { test: RegExp }) => !test.test(".css"))

  config.module.rules.push(
    {
      test: /\.vue$/,
      use: {
        loader: "vue-loader",
        options: {
          shadowMode: false,
          loaders: {
            css: "vue-style-loader!css-loader",
            scss: "vue-style-loader!css-loader!sass-loader",
          }
        }
      }
    },
    {
      test: /\.[tj]sx?$/,
      exclude: /node_modules/,
      use: {
        loader: "ts-loader",
        options: {
          transpileOnly: true,
          appendTsSuffixTo: [/\.vue$/],
        }
      },
    },
    {
      test: /\.s?css$/,
      use: [
        'vue-style-loader',
        'css-loader',
        'sass-loader'
      ]
    }
  );

  // plugins
  config.plugins = [
    new VueLoaderPlugin(),
    new ForkTsCheckerPlugin(),

    new HtmlWebpackPlugin({
      template: htmlTemplate,
      inject: true,
    }),
  ];

  return config;
}
