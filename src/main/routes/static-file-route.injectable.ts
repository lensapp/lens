/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { SupportedFileExtension } from "../router/router-content-types";
import { contentTypes } from "../router/router-content-types";
import logger from "../logger";
import { getRouteInjectable } from "../router/router.injectable";
import { publicPath } from "../../common/vars";
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
import staticFilesDirectoryInjectable from "../../common/vars/static-files-directory.injectable";
import appNameInjectable from "../../common/vars/app-name.injectable";

interface ProductionDependencies {
  readFileBuffer: (path: string) => Promise<Buffer>;
  getAbsolutePath: GetAbsolutePath;
  joinPaths: JoinPaths;
  staticFilesDirectory: string;
  appName: string;
}

const handleStaticFileInProduction = ({
  readFileBuffer,
  getAbsolutePath,
  joinPaths,
  staticFilesDirectory,
  appName,
}: ProductionDependencies) => (
  async ({ params }: LensApiRequest<"/{path*}">): Promise<RouteResponse<Buffer>> => {
    let filePath = params.path;

    for (let retryCount = 0; retryCount < 5; retryCount += 1) {
      const asset = joinPaths(staticFilesDirectory, filePath);
      const normalizedFilePath = getAbsolutePath(asset);

      if (!normalizedFilePath.startsWith(staticFilesDirectory)) {
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
  }
);

interface DevelopmentDependencies {
  proxy: httpProxy;
  appName: string;
}

const handleStaticFileInDevelopment = ({
  proxy,
  appName,
}: DevelopmentDependencies) => (
  ({ raw: { req, res }}: LensApiRequest<"/{path*}">): RouteResponse<Buffer> => {
    if (req.url === "/" || !req.url?.startsWith("/build/")) {
      req.url = `${publicPath}/${appName}.html`;
    }

    proxy.web(req, res, {
      target: `http://127.0.0.1:${webpackDevServerPort}`,
    });

    return { proxy };
  }
);

const staticFileRouteInjectable = getRouteInjectable({
  id: "static-file-route",

  instantiate: (di) => {
    const isDevelopment = di.inject(isDevelopmentInjectable);
    const readFileBuffer = di.inject(readFileBufferInjectable);
    const getAbsolutePath = di.inject(getAbsolutePathInjectable);
    const joinPaths = di.inject(joinPathsInjectable);
    const staticFilesDirectory = di.inject(staticFilesDirectoryInjectable);
    const appName = di.inject(appNameInjectable);

    return route({
      method: "get",
      path: `/{path*}`,
    })(
      isDevelopment
        ? handleStaticFileInDevelopment({
          proxy: httpProxy.createProxy(),
          appName,
        })
        : handleStaticFileInProduction({
          readFileBuffer,
          getAbsolutePath,
          joinPaths,
          staticFilesDirectory,
          appName,
        }),
    );
  },
});

export default staticFileRouteInjectable;
