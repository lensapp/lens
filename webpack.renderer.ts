import { htmlTemplate, isDevelopment, isProduction, outDir, reactAppName, rendererDir, sassCommonVars, vueAppName } from "./src/common/vars";
import path from "path";
import webpack from "webpack";
import HtmlWebpackPlugin from "html-webpack-plugin";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import TerserPlugin from "terser-webpack-plugin";
import ForkTsCheckerPlugin from "fork-ts-checker-webpack-plugin"
import CircularDependencyPlugin from "circular-dependency-plugin"
import { VueLoaderPlugin } from "vue-loader"

export default [
  webpackConfigReact,
  webpackConfigVue,
];

export function webpackConfigReact(): webpack.Configuration {
  return {
    context: __dirname,
    name: "react",
    target: "web",
    devtool: "source-map", // todo: optimize in dev-mode with webpack.SourceMapDevToolPlugin
    mode: isProduction ? "production" : "development",
    cache: isDevelopment,
    entry: {
      [reactAppName]: path.resolve(rendererDir, "components/app.tsx"),
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
                ]
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
        filename: `${reactAppName}.html`,
        template: htmlTemplate,
        inject: true,
      }),

      new MiniCssExtractPlugin({
        filename: "[name].css",
      }),
    ],
  }
}

export function webpackConfigVue(): webpack.Configuration {
  const config = webpackConfigReact();

  config.name = "vue"
  config.target = "electron-renderer";
  config.resolve.extensions.push(".vue");

  config.entry = {
    [vueAppName]: path.resolve(rendererDir, "_vue/index.js")
  }
  config.resolve.alias = {
    "@": rendererDir,
    "vue$": "vue/dist/vue.esm.js",
    "vue-router$": "vue-router/dist/vue-router.esm.js",
  }

  // rules and loaders
  config.module.rules = config.module.rules
    .filter(({ test }: { test: RegExp }) => !test.test(".ts"))
    .filter(({ test }: { test: RegExp }) => !test.test(".css"))

  config.module.rules.push(
    {
      test: /\.node$/,
      use: "node-loader"
    },
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
      filename: `${vueAppName}.html`,
      template: htmlTemplate,
      inject: true,
    }),
  ];

  return config;
}
