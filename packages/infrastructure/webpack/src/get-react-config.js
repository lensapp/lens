const getNodeConfig = require("./get-node-config");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const MonacoWebpackPlugin = require("monaco-editor-webpack-plugin");
const path = require("path");

const sassCommonVars = path.resolve(__dirname, "..", "..", "..", "core", "src", "renderer", "components/vars.scss");

module.exports =
  ({ miniCssExtractPluginLoader = MiniCssExtractPlugin.loader } = {}) =>
  ({ entrypointFilePath, outputDirectory }) => {
    const nodeConfig = getNodeConfig({
      entrypointFilePath,
      outputDirectory,
    });

    return {
      ...nodeConfig,

      plugins: [
        ...nodeConfig.plugins,

        new MiniCssExtractPlugin({
          filename: "[name].css",
        }),

        // see also: https://github.com/Microsoft/monaco-editor-webpack-plugin#options
        new MonacoWebpackPlugin({
          languages: ["json", "yaml"],
          // Hack: should be true only for development.
          globalAPI: true
        }),
      ],

      module: {
        ...nodeConfig.module,

        rules: [
          ...nodeConfig.module.rules,

          {
            test: /\.s?css$/,

            use: [
              miniCssExtractPluginLoader,

              {
                loader: "css-loader",

                options: {
                  sourceMap: false,

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
                  sourceMap: false,
                  postcssOptions: {
                    // hack: commented
                    // plugins: ["tailwindcss"],
                  },
                },
              },

              {
                loader: "sass-loader",
                options: {
                  sourceMap: false,
                  additionalData: `@import "${path.basename(sassCommonVars)}";`,

                  sassOptions: {
                    includePaths: [path.dirname(sassCommonVars)],
                  },
                },
              },
            ],
          },

          {
            test: /\.(ttf|eot|woff2?)$/,
            type: "asset/resource",
          },

          {
            test: /\.svg$/,
            type: "asset/source", // exports the source code of the asset, so we get XML
          },

          {
            test: /\.(jpg|png|ico)$/,
            type: "asset/resource", // path to file, e.g. "/static/build/assets/*"
          },
        ],
      },
    };
  };
