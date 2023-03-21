/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { LensProxy } from "./lens-proxy";
import loggerInjectable from "../../common/logger.injectable";
import lensProxyHttpsServerInjectable from "./https-proxy/server.injectable";
import proxyRetryInjectable from "./proxy/retry.injectable";
import attemptToListenInjectable from "./attempt-to-listen.injectable";

const lensProxyInjectable = getInjectable({
  id: "lens-proxy",

  instantiate: (di) => new LensProxy({
    proxyServer: di.inject(lensProxyHttpsServerInjectable),
    logger: di.inject(loggerInjectable),
    proxyRetry: di.inject(proxyRetryInjectable),
    attemptToListen: di.inject(attemptToListenInjectable),
  }),
});

export default lensProxyInjectable;
