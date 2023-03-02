const getNodeConfig = require("./get-node-config");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

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
                loader: "sass-loader",
                options: {
                  sourceMap: false,
                },
              },
            ],
          },
        ],
      },
    };
  };
