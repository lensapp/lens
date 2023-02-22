const nodeConfig = require("./node-config");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
  ...nodeConfig,

  plugins: [
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
          MiniCssExtractPlugin.loader,
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
