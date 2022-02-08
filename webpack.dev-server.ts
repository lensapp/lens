/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import Webpack from "webpack";
import WebpackDevServer from "webpack-dev-server";
import { webpackLensRenderer } from "./webpack.renderer";
import { buildDir, webpackDevServerPort } from "./src/common/vars";
import logger from "./src/common/logger";
import { getClusterIdFromHost } from "./src/common/utils";

/**
 * Creates `webpack-dev-server`
 * API docs:
 * @url https://webpack.js.org/configuration/dev-server/
 * @url https://github.com/chimurai/http-proxy-middleware
 */
export function createDevServer(lensProxyPort: number): WebpackDevServer {
  const config = webpackLensRenderer();
  const compiler = Webpack(config);

  const server = new WebpackDevServer({
    allowedHosts: "all",
    host: "localhost",
    port: webpackDevServerPort,
    static: buildDir, // aka `devServer.contentBase` in webpack@4
    hot: true, // enable HMR when supported by modules or page refresh by default {liveReload:true}
    proxy: {
      '*': {
        router(req) {
          logger.info(`[WEBPACK-DEV-SERVER]: proxy path ${req.path}`, req.headers);

          const clusterId = getClusterIdFromHost(req.headers.host);
          if (clusterId) {
            return `http://${clusterId}.localhost:${lensProxyPort}`;
          }

          return `http://localhost:${lensProxyPort}`;
        },
        secure: false, // allow http connections
        logLevel: "debug",
      }
    },
    client: {
      overlay: false, // don't show warnings and errors on top of rendered app view
      logging: "error",
    },
  }, compiler);

  logger.info(`[WEBPACK-DEV-SERVER]: created with options`, server.options);

  return server;
}
