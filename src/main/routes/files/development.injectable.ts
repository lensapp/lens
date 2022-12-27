/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import httpProxy from "http-proxy";
import { webpackDevServerPort } from "../../../../webpack/vars";
import { publicPath } from "../../../common/vars";
import type { LensApiRequest, RouteResponse } from "../../router/route";

const devStaticFileRouteHandlerInjectable = getInjectable({
  id: "dev-static-file-route-handler",
  instantiate: () => {
    const proxy = httpProxy.createProxy();
    const proxyTarget = `http://127.0.0.1:${webpackDevServerPort}`;

    return async ({ raw: { req, res }}: LensApiRequest<"/{path*}">): Promise<RouteResponse<Buffer>> => {
      if (req.url === "/" || !req.url) {
        req.url = `${publicPath}/index.html`;
      } else if (!req.url.startsWith("/build/")) {
        return { statusCode: 404 };
      }

      proxy.web(req, res, { target: proxyTarget });

      return { proxy };
    };
  },
});

export default devStaticFileRouteHandlerInjectable;
