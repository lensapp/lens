/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import Webpack from "webpack";
import WebpackDevServer from "webpack-dev-server";
import { webpackLensRenderer } from "./webpack.renderer";
import { buildDir } from "./src/common/vars";
import logger from "./src/common/logger";

export interface DevServer extends WebpackDevServer {
}

/**
 * Creates `webpack-dev-server`
 * API docs:
 * @url https://webpack.js.org/configuration/dev-server/
 * @url https://github.com/chimurai/http-proxy-middleware
 */
export function createDevServer(lensProxyPort: number): DevServer {
  const config = webpackLensRenderer({ showVars: false });
  const compiler = Webpack(config);

  const server = new WebpackDevServer({
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
    allowedHosts: "all",
    host: "localhost",
    static: buildDir, // aka `devServer.contentBase` in webpack@4
    hot: "only", // use HMR only without errors
    liveReload: false,
    proxy: {
      "*": {
        router(req) {
          logger.silly(`[WEBPACK-DEV-SERVER]: proxy path ${req.path}`, req.headers);

          return `http://localhost:${lensProxyPort}`;
        },
        secure: false, // allow http connections
        ws: true, // proxy websockets, e.g. terminal
        logLevel: "error",
      },
    },
    client: {
      overlay: false, // don't show warnings and errors on top of rendered app view
      logging: "error",
    },
  }, compiler);

  logger.info(`[WEBPACK-DEV-SERVER]: created with options`, server.options);

  return server;
}
