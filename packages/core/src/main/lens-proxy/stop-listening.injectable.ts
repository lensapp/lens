/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import loggerInjectable from "../../common/logger.injectable";
import lensProxyHttpsServerInjectable from "./https-proxy/server.injectable";
import proxyRetryInjectable from "./proxy/retry.injectable";

const stopLensProxyListeningInjectable = getInjectable({
  id: "stop-lens-proxy-listening",
  instantiate: (di) => {
    const logger = di.inject(loggerInjectable);
    const proxyServer = di.inject(lensProxyHttpsServerInjectable);
    const proxyRetry = di.inject(proxyRetryInjectable);

    return () => {
      logger.info("[LENS-PROXY]: Closing server");
      proxyServer.close();
      proxyRetry.close();
    };
  },
});

export default stopLensProxyListeningInjectable;
