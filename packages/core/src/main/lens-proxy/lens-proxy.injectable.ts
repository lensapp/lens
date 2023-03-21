/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { LensProxy } from "./lens-proxy";
import lensProxyPortInjectable from "./lens-proxy-port.injectable";
import emitAppEventInjectable from "../../common/app-event-bus/emit-event.injectable";
import loggerInjectable from "../../common/logger.injectable";
import lensProxyHttpsServerInjectable from "./https-proxy/server.injectable";
import proxyRetryInjectable from "./proxy/retry.injectable";

const lensProxyInjectable = getInjectable({
  id: "lens-proxy",

  instantiate: (di) => new LensProxy({
    proxyServer: di.inject(lensProxyHttpsServerInjectable),
    lensProxyPort: di.inject(lensProxyPortInjectable),
    emitAppEvent: di.inject(emitAppEventInjectable),
    logger: di.inject(loggerInjectable),
    proxyRetry: di.inject(proxyRetryInjectable),
  }),
});

export default lensProxyInjectable;
