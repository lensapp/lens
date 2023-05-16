/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import httpProxy from "http-proxy";
import path from "path";
import { webpackDevServerPort } from "../../../../webpack/vars";
import type { LensApiRequest, RouteResponse } from "../../router/route";

const devStaticFileRouteHandlerInjectable = getInjectable({
  id: "dev-static-file-route-handler",
  instantiate: () => {
    const proxy = httpProxy.createProxy();
    const proxyTarget = `http://127.0.0.1:${webpackDevServerPort}`;

    return async ({ raw: { req, res }, params }: LensApiRequest<"/{path*}">): Promise<RouteResponse<Buffer>> => {
      const filePath = (!params.path || params.path === "/")
        ? "/build/index.html"
        : path.posix.extname(params.path)
          ? params.path
          : "/build/index.html";

      req.url = filePath;

      proxy.web(req, res, { target: proxyTarget });

      return { proxy };
    };
  },
});

export default devStaticFileRouteHandlerInjectable;
