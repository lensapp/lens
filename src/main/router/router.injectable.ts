/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import isDevelopmentInjectable from "../../common/vars/is-development.injectable";
import httpProxy from "http-proxy";
import { Router } from "../router";
import routePortForwardInjectable
  from "../routes/port-forward/route-port-forward/route-port-forward.injectable";

const routerInjectable = getInjectable({
  id: "router",

  instantiate: (di) => {
    const isDevelopment = di.inject(isDevelopmentInjectable);
    const proxy = isDevelopment ? httpProxy.createProxy() : undefined;

    return new Router({
      routePortForward: di.inject(routePortForwardInjectable),
      httpProxy: proxy,
    });
  },
});

export default routerInjectable;
