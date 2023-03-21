/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { LensProxy } from "./lens-proxy";
import lensProxyPortInjectable from "./lens-proxy-port.injectable";
import emitAppEventInjectable from "../../common/app-event-bus/emit-event.injectable";
import loggerInjectable from "../../common/logger.injectable";
import proxyInjectable from "./proxy.injectable";
import handleRouteRequestInjectable from "./handle-route-request.injectable";
import lensProxyHttpsServerInjectable from "./https-proxy/server.injectable";

const lensProxyInjectable = getInjectable({
  id: "lens-proxy",

  instantiate: (di) => new LensProxy({
    proxy: di.inject(proxyInjectable),
    proxyServer: di.inject(lensProxyHttpsServerInjectable),
    handleRouteRequest: di.inject(handleRouteRequestInjectable),
    lensProxyPort: di.inject(lensProxyPortInjectable),
    emitAppEvent: di.inject(emitAppEventInjectable),
    logger: di.inject(loggerInjectable),
  }),
});

export default lensProxyInjectable;
