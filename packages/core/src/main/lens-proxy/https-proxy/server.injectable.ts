/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { createServer } from "https";
import lensProxyCertificateInjectable from "../../../common/certificate/lens-proxy-certificate.injectable";
import handleRouteRequestInjectable from "../handle-route-request.injectable";
import lensProxyHttpsServerOnUpgradeInjectable from "./on-upgrade.injectable";
import { ProxyIncomingMessage } from "../messages";

const lensProxyHttpsServerInjectable = getInjectable({
  id: "lens-proxy-https-server",
  instantiate: (di) => {
    const certificate = di.inject(lensProxyCertificateInjectable).get();
    const handleRouteRequest = di.inject(handleRouteRequestInjectable);

    const server = createServer({
      key: certificate.private,
      cert: certificate.cert,
      IncomingMessage: ProxyIncomingMessage,
    }, handleRouteRequest);

    server.on("upgrade", di.inject(lensProxyHttpsServerOnUpgradeInjectable));

    return server;
  },
});

export default lensProxyHttpsServerInjectable;
