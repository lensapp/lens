/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { SupportedFileExtension } from "../router/router-content-types";
import { contentTypes } from "../router/router-content-types";
import logger from "../logger";
import { getRouteInjectable } from "../router/router.injectable";
import { appName, publicPath, staticFilesDirectory } from "../../common/vars";
import path from "path";
import isDevelopmentInjectable from "../../common/vars/is-development.injectable";
import httpProxy from "http-proxy";
import readFileBufferInjectable from "../../common/fs/read-file-buffer.injectable";
import type { GetAbsolutePath } from "../../common/path/get-absolute-path.injectable";
import getAbsolutePathInjectable from "../../common/path/get-absolute-path.injectable";
import type { JoinPaths } from "../../common/path/join-paths.injectable";
import joinPathsInjectable from "../../common/path/join-paths.injectable";
import { webpackDevServerPort } from "../../../webpack/vars";
import type { LensApiRequest, RouteResponse } from "../router/route";
import { route } from "../router/route";

interface ProductionDependencies {
  readFileBuffer: (path: string) => Promise<Buffer>;
  getAbsolutePath: GetAbsolutePath;
  joinPaths: JoinPaths;
}

const handleStaticFileInProduction =
  ({ readFileBuffer, getAbsolutePath, joinPaths }: ProductionDependencies) =>
    async ({ params }: LensApiRequest<"/{path*}">): Promise<RouteResponse<Buffer>> => {
      const staticPath = getAbsolutePath(staticFilesDirectory);
      let filePath = params.path;

      for (let retryCount = 0; retryCount < 5; retryCount += 1) {
        const asset = joinPaths(staticPath, filePath);
        const normalizedFilePath = getAbsolutePath(asset);

        if (!normalizedFilePath.startsWith(staticPath)) {
          return { statusCode: 404 };
        }

        try {
          const fileExtension = path
            .extname(asset)
            .slice(1) as SupportedFileExtension;

          const contentType = contentTypes[fileExtension] || contentTypes.txt;

          return { response: await readFileBuffer(asset), contentType };
        } catch (err) {
          if (retryCount > 5) {
            logger.error("handleStaticFile:", String(err));

            return { statusCode: 404 };
          }

          filePath = `${publicPath}/${appName}.html`;
        }
      }

      return { statusCode: 404 };
    };

interface DevelopmentDependencies {
  proxy: httpProxy;
}

const handleStaticFileInDevelopment =
  ({ proxy }: DevelopmentDependencies) =>
    ({ raw: { req, res }}: LensApiRequest<"/{path*}">): RouteResponse<Buffer> => {
      if (req.url === "/" || !req.url?.startsWith("/build/")) {
        req.url = `${publicPath}/${appName}.html`;
      }

      proxy.web(req, res, {
        target: `http://127.0.0.1:${webpackDevServerPort}`,
      });

      return { proxy };
    };

const staticFileRouteInjectable = getRouteInjectable({
  id: "static-file-route",

  instantiate: (di) => {
    const isDevelopment = di.inject(isDevelopmentInjectable);

    return route({
      method: "get",
      path: `/{path*}`,
    })(
      isDevelopment
        ? handleStaticFileInDevelopment({
          proxy: httpProxy.createProxy(),
        })
        : handleStaticFileInProduction({
          readFileBuffer: di.inject(readFileBufferInjectable),
          getAbsolutePath: di.inject(getAbsolutePathInjectable),
          joinPaths: di.inject(joinPathsInjectable),
        }),
    );
  },
});

export default staticFileRouteInjectable;
