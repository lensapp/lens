/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import Webpack from "webpack";
import WebpackDevServer from "webpack-dev-server";
import { webpackLensRenderer } from "./webpack.renderer";
import { buildDir } from "./src/common/vars";

export function createDevServer(lensProxyPort: number): WebpackDevServer {
  const config = webpackLensRenderer();
  const compiler = Webpack(config);

  return new WebpackDevServer({
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
    allowedHosts: "all",
    host: "localhost",
    // static: buildDir, // aka `devServer.contentBase` in webpack@4
    hot: true, // enable HMR when supported by modules
    proxy: {
      // https://webpack.js.org/configuration/dev-server/#devserverproxy
      "*": `//:localhost:${lensProxyPort}`,
      secure: false, // allow http connections
      changeOrigin: true,
      context: [buildDir],
      bypass: function (req, res, proxyOptions) {
        console.log(`[PROXY]: path ${req.path}`);
        return null; // continue with proxy, return false for "404"-error
      },
    },
    client: {
      // don't show warnings and errors on top of rendered app view
      overlay: false,
    },
  }, compiler);
}
