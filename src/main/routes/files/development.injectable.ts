/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import httpProxy from "http-proxy";
import path from "path";
import { webpackDevServerPort } from "../../../../webpack/vars";
import readFileBufferInjectable from "../../../common/fs/read-file-buffer.injectable";
import joinPathsInjectable from "../../../common/path/join-paths.injectable";
import { publicPath } from "../../../common/vars";
import developmentBundledLibrariesDirectoryInjectable from "../../../common/vars/development-bundled-libraries-dir.injectable";
import appNameInjectable from "../../../common/vars/app-name.injectable";
import type { LensApiRequest, RouteResponse } from "../../router/route";
import type { SupportedFileExtension } from "../../router/router-content-types";
import { contentTypes } from "../../router/router-content-types";

const devStaticFileRouteHandlerInjectable = getInjectable({
  id: "dev-static-file-route-handler",
  instantiate: (di) => {
    const proxy = httpProxy.createProxy();
    const appName = di.inject(appNameInjectable);
    const readFileBuffer = di.inject(readFileBufferInjectable);
    const proxyTarget = `http://127.0.0.1:${webpackDevServerPort}`;
    const bundledLibrariesDirectory = di.inject(developmentBundledLibrariesDirectoryInjectable);
    const joinPaths = di.inject(joinPathsInjectable);

    return async ({ raw: { req, res }}: LensApiRequest<"/{path*}">): Promise<RouteResponse<Buffer>> => {
      if (req.url === "/" || !req.url) {
        req.url = `${publicPath}/${appName}.html`;
      } else if (req.url.startsWith("/bundles/")) {
        const bundledLibraryFilePath = joinPaths(bundledLibrariesDirectory, req.url.replace("/bundles/", ""));

        if (!bundledLibraryFilePath.startsWith(bundledLibrariesDirectory)) {
          return { statusCode: 404 };
        }

        try {
          const fileExtension = path
            .extname(bundledLibraryFilePath)
            .slice(1) as SupportedFileExtension;

          const contentType = contentTypes[fileExtension] || contentTypes.txt;

          return {
            response: await readFileBuffer(bundledLibraryFilePath),
            contentType,
          };
        } catch {
          return { statusCode: 404 };
        }
      } else if (!req.url.startsWith("/build/")) {
        return { statusCode: 404 };
      }

      proxy.web(req, res, { target: proxyTarget });

      return { proxy };
    };
  },
});

export default devStaticFileRouteHandlerInjectable;
