/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type webpack from "webpack";
import path from "path";
import ForkTsCheckerPlugin from "fork-ts-checker-webpack-plugin";
import webpackLensMain from "./main";
import { buildDir } from "./vars";

const webpackLensCommon = (): webpack.Configuration => {
  const mainConfig = webpackLensMain();

  return {
    ...mainConfig,
    name: "lens-app-common",
    entry: {
      common: path.resolve(__dirname, "..", "src", "common", "library.ts"),
    },
    output: {
      publicPath: "",
      library: {
        type: "commonjs2",
      },
      path: path.resolve(buildDir, "library"),
    },
    optimization: {
      minimize: false,
    },
    plugins: [
      new ForkTsCheckerPlugin({}),
    ],
  };
};

export default webpackLensCommon;
