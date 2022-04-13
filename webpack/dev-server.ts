/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import Webpack from "webpack";
import WebpackDevServer from "webpack-dev-server";
import { webpackLensRenderer } from "./renderer";
import logger from "../src/common/logger";
import { buildDir, webpackDevServerPort } from "./vars";

/**
 * API docs:
 * @url https://webpack.js.org/configuration/dev-server/
 * @url https://github.com/chimurai/http-proxy-middleware
 */
const config = webpackLensRenderer({ showVars: false });
const compiler = Webpack(config);

const server = new WebpackDevServer({
  setupExitSignals: true,
  headers: {
    "Access-Control-Allow-Origin": "*",
  },
  allowedHosts: "all",
  host: "localhost",
  port: webpackDevServerPort,
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

server.start();
