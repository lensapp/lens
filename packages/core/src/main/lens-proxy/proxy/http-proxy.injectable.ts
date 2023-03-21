/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import onErrorInjectable from "./on-error.injectable";
import onProxyResInjectable from "./on-proxy-res.injectable";
import rawHttpProxyInjectable from "./raw-proxy.injectable";

const httpProxyInjectable = getInjectable({
  id: "http-proxy",
  instantiate: (di) => {
    const proxy = di.inject(rawHttpProxyInjectable);

    proxy.on("proxyRes", di.inject(onProxyResInjectable));
    proxy.on("error", di.inject(onErrorInjectable));

    return proxy;
  },
});

export default httpProxyInjectable;
