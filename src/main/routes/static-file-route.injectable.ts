/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { LensApiRequest, Route } from "../router";
import logger from "../logger";
import { routeInjectionToken } from "../router/router.injectable";
import {
  appName,
  publicPath,
} from "../../common/vars";
import path from "path";
import readFileInjectable from "../../common/fs/read-file.injectable";
import isDevelopmentInjectable from "../../common/vars/is-development.injectable";
import httpProxy from "http-proxy";
import { Router } from "../router";

function getMimeType(filename: string) {
  const mimeTypes: Record<string, string> = {
    html: "text/html",
    txt: "text/plain",
    css: "text/css",
    gif: "image/gif",
    jpg: "image/jpeg",
    png: "image/png",
    svg: "image/svg+xml",
    js: "application/javascript",
    woff2: "font/woff2",
    ttf: "font/ttf",
  };

  return mimeTypes[path.extname(filename).slice(1)] || "text/plain";
}

interface ProductionDependencies {
  readFile: (path: string) => Promise<Buffer>;
}

const handleStaticFileInProduction =
  ({ readFile }: ProductionDependencies) =>
    async ({ params, response }: LensApiRequest): Promise<void> => {
      let filePath = params.path;

      for (let retryCount = 0; retryCount < 5; retryCount += 1) {
        const asset = path.join(Router.rootPath, filePath);
        const normalizedFilePath = path.resolve(asset);

        if (!normalizedFilePath.startsWith(Router.rootPath)) {
          response.statusCode = 404;

          return response.end();
        }

        try {
          const data = await readFile(asset);

          response.setHeader("Content-Type", getMimeType(asset));
          response.write(data);
          response.end();
        } catch (err) {
          if (retryCount > 5) {
            logger.error("handleStaticFile:", err.toString());
            response.statusCode = 404;

            return response.end();
          }

          filePath = `${publicPath}/${appName}.html`;
        }
      }
    };

interface DevelopmentDependencies {
  proxy: httpProxy;
}

const handleStaticFileInDevelopment =
  ({ proxy }: DevelopmentDependencies) =>
    (apiReq: LensApiRequest) => {
      const { req, res } = apiReq.raw;

      if (req.url === "/" || !req.url.startsWith("/build/")) {
        req.url = `${publicPath}/${appName}.html`;
      }

      proxy.web(req, res, {
        target: "http://127.0.0.1:8080",
      });
    };

const staticFileRouteInjectable = getInjectable({
  id: "static-file-route",

  instantiate: (di): Route => {
    const isDevelopment = di.inject(isDevelopmentInjectable);

    return {
      method: "get",
      path: `/{path*}`,
      handler: isDevelopment
        ? handleStaticFileInDevelopment({ proxy: httpProxy.createProxy() })
        : handleStaticFileInProduction({ readFile: di.inject(readFileInjectable) }),
    };
  },

  injectionToken: routeInjectionToken,
});

export default staticFileRouteInjectable;
