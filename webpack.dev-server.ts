/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import Webpack from "webpack";
import WebpackDevServer from "webpack-dev-server";
import { webpackLensRenderer } from "./webpack.renderer";
import { buildDir } from "./src/common/vars";
import logger from "./src/common/logger";

/**
 * Creates `webpack-dev-server`
 * API docs:
 * @url https://webpack.js.org/configuration/dev-server/
 * @url https://github.com/chimurai/http-proxy-middleware
 */
function createDevServer(): WebpackDevServer {
  const config = webpackLensRenderer({ showVars: false });
  const compiler = Webpack(config);

  const server = new WebpackDevServer({
    setupExitSignals: true,
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
    allowedHosts: "all",
    host: "localhost",
    static: buildDir, // aka `devServer.contentBase` in webpack@4
    hot: "only", // use HMR only without errors
    liveReload: false,
    devMiddleware: {
      writeToDisk: false,
      index: "OpenLensDev.html",
      publicPath: "/build",
    },
    proxy: {
      "^/$": "/build/",
    },
    client: {
      overlay: false, // don't show warnings and errors on top of rendered app view
      logging: "error",
    },
  }, compiler);

  logger.info(`[WEBPACK-DEV-SERVER]: created with options`, server.options);

  return server;
}

const server = createDevServer();

server.start();
