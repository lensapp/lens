import { extensionsDir, extensionsLibName, extensionsRendererLibName } from "./src/common/vars";
import path from "path";
import webpack from "webpack";
import nodeExternals from "webpack-node-externals";
import { webpackLensRenderer } from "./webpack.renderer";
import ForkTsCheckerPlugin from "fork-ts-checker-webpack-plugin";
import ProgressBarPlugin from "progress-bar-webpack-plugin";
import MiniCssExtractPlugin from "mini-css-extract-plugin";

export default [
  webpackExtensionsApi,
  webpackExtensionsRendererApi
]

// todo: use common chunks/externals for "react", "react-dom", etc.
export function webpackExtensionsApi(): webpack.Configuration {
  const config = webpackLensRenderer({ showVars: false })
  config.name = "extensions-api"
  config.entry = {
    [extensionsLibName]: path.resolve(extensionsDir, "extension-api.ts")
  }
  config.externals = [
    nodeExternals()
  ]
  config.plugins = [
    new ProgressBarPlugin(),
    new ForkTsCheckerPlugin(),
  ]
  config.output.libraryTarget = "commonjs2"
  config.devtool = "nosources-source-map"
  return config
}

export function webpackExtensionsRendererApi(): webpack.Configuration {
  const config = webpackLensRenderer({ showVars: false })
  config.name = "extensions-renderer-api"
  config.entry = {
    [extensionsRendererLibName]: path.resolve(extensionsDir, "extension-renderer-api.ts")
  }
  config.plugins = [
    new ProgressBarPlugin(),
    new ForkTsCheckerPlugin(),
    new MiniCssExtractPlugin({
      filename: "[name].css",
    })
  ]
  config.output.libraryTarget = "commonjs2"
  config.devtool = "nosources-source-map"
  return config
}
