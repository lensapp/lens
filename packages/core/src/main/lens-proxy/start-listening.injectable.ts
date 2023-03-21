/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import loggerInjectable from "../../common/logger.injectable";
import attemptToListenInjectable from "./attempt-to-listen.injectable";
import { disallowedPorts } from "./disallowed-ports";
import lensProxyHttpsServerInjectable from "./https-proxy/server.injectable";

/**
 * Starts the lens proxy.
 * @resolves After the server is listening on a good port
 * @rejects if there is an error before that happens
 */
export type StartLensProxyListening = () => Promise<void>;

const startLensProxyListeningInjectable = getInjectable({
  id: "start-lens-proxy-listening",
  instantiate: (di): StartLensProxyListening => {
    const attemptToListen = di.inject(attemptToListenInjectable);
    const logger = di.inject(loggerInjectable);
    const proxyServer = di.inject(lensProxyHttpsServerInjectable);

    return async () => {
      const seenPorts = new Set<number>();

      while(true) {
        proxyServer.close();
        const port = await attemptToListen();

        if (!disallowedPorts.has(port)) {
          // We didn't get a port that would result in an ERR_UNSAFE_PORT error, use it
          return;
        }

        logger.warn(`[LENS-PROXY]: Proxy server has with port known to be considered unsafe to connect to by chrome, restarting...`);

        if (seenPorts.has(port)) {
          /**
           * Assume that if we have seen the port before, then the OS has looped
           * through all the ports possible and we will not be able to get a safe
           * port.
           */
          throw new Error("Failed to start LensProxy due to seeing too many unsafe ports. Please restart Lens.");
        } else {
          seenPorts.add(port);
        }
      }
    };
  },
});

export default startLensProxyListeningInjectable;
