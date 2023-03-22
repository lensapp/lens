/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import emitAppEventInjectable from "../../common/app-event-bus/emit-event.injectable";
import loggerInjectable from "../../common/logger.injectable";
import lensProxyHttpsServerInjectable from "./https-proxy/server.injectable";
import lensProxyPortInjectable from "./lens-proxy-port.injectable";

/**
 * Starts to listen on an OS provided port. Will reject if the server throws
 * an error.
 *
 * Resolves with the port number that was picked
 */
export type AttemptToListen = () => Promise<number>;

const attemptToListenInjectable = getInjectable({
  id: "attempt-to-listen",
  instantiate: (di) => {
    const proxyServer = di.inject(lensProxyHttpsServerInjectable);
    const lensProxyPort = di.inject(lensProxyPortInjectable);
    const logger = di.inject(loggerInjectable);
    const emitAppEvent = di.inject(emitAppEventInjectable);

    return () => new Promise<number>((resolve, reject) => {
      proxyServer
        .once("listening", () => {
          proxyServer.removeAllListeners("error"); // don't reject the promise

          const { address, port } = proxyServer.address();

          lensProxyPort.set(port);

          logger.info(`[LENS-PROXY]: Proxy server has started at ${address}:${port}`);

          proxyServer.on("error", (error) => {
            logger.info(`[LENS-PROXY]: Subsequent error: ${error}`);
          });

          emitAppEvent({ name: "lens-proxy", action: "listen", params: { port }});
          resolve(port);
        })
        .once("error", (error) => {
          logger.info(`[LENS-PROXY]: Proxy server failed to start: ${error}`);
          reject(error);
        });

      proxyServer.listen(0, "127.0.0.1");
    });
  },
});

export default attemptToListenInjectable;
