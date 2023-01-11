/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import Webpack from "webpack";
import WebpackDevServer from "webpack-dev-server";
import renderer from "./renderer";
import { buildDir, webpackDevServerPort } from "./vars";

/**
 * API docs:
 * @url https://webpack.js.org/configuration/dev-server/
 * @url https://github.com/chimurai/http-proxy-middleware
 */
const compiler = Webpack(renderer);

const server = new WebpackDevServer({
  setupExitSignals: true,
  headers: {
    "Access-Control-Allow-Origin": "*",
  },
  allowedHosts: ".lens.app",
  host: "localhost",
  port: webpackDevServerPort,
  static: buildDir, // aka `devServer.contentBase` in webpack@4
  hot: "only", // use HMR only without errors
  liveReload: false,
  devMiddleware: {
    writeToDisk: true,
    index: "index.html",
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

console.info(`[WEBPACK-DEV-SERVER]: created with options`, server.options);

server.start();
