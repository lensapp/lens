/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import lensProxyPortInjectable from "./lens-proxy-port.injectable";
import emitAppEventInjectable from "../../common/app-event-bus/emit-event.injectable";
import loggerInjectable from "../../common/logger.injectable";
import lensProxyCertificateInjectable from "../../common/certificate/lens-proxy-certificate.injectable";
import type net from "net";
import { createServer } from "https";
import handleLensRequestInjectable from "./handle-lens-request.injectable";
import routeUpgradeRequestInjectable from "./upgrade-router/router.injectable";

export interface LensProxy {
  listen: () => Promise<void>;
  close: () => void;
}

/**
 * This is the list of ports that chrome considers unsafe to allow HTTP
 * conntections to. Because they are the standard ports for processes that are
 * too forgiving in the connection types they accept.
 *
 * If we get one of these ports, the easiest thing to do is to just try again.
 *
 * Source: https://chromium.googlesource.com/chromium/src.git/+/refs/heads/main/net/base/port_util.cc
 */
const disallowedPorts = new Set([
  1, 7, 9, 11, 13, 15, 17, 19, 20, 21, 22, 23, 25, 37, 42, 43, 53, 69, 77, 79,
  87, 95, 101, 102, 103, 104, 109, 110, 111, 113, 115, 117, 119, 123, 135, 137,
  139, 143, 161, 179, 389, 427, 465, 512, 513, 514, 515, 526, 530, 531, 532,
  540, 548, 554, 556, 563, 587, 601, 636, 989, 990, 993, 995, 1719, 1720, 1723,
  2049, 3659, 4045, 5060, 5061, 6000, 6566, 6665, 6666, 6667, 6668, 6669, 6697,
  10080,
]);

const lensProxyInjectable = getInjectable({
  id: "lens-proxy",

  instantiate: (di): LensProxy => {
    const lensProxyPort = di.inject(lensProxyPortInjectable);
    const emitAppEvent = di.inject(emitAppEventInjectable);
    const logger = di.inject(loggerInjectable);
    const certificate = di.inject(lensProxyCertificateInjectable).get();
    const handleLensRequest = di.inject(handleLensRequestInjectable);
    const routeUpgradeRequest = di.inject(routeUpgradeRequestInjectable);

    const proxyServer = createServer(
      {
        key: certificate.private,
        cert: certificate.cert,
      },
      handleLensRequest.handle,
    )
      .on("upgrade", routeUpgradeRequest);

    const attemptToListen = () => new Promise<number>((resolve, reject) => {
      proxyServer.listen(0, "127.0.0.1");

      const onInitialError = (error: Error) => {
        logger.info(`[LENS-PROXY]: Proxy server failed to start: ${error}`);
        reject(error);
      };

      proxyServer
        .once("listening", () => {
          proxyServer.removeListener("error", onInitialError);

          const { address, port } = proxyServer.address() as net.AddressInfo;

          lensProxyPort.set(port);
          logger.info(`[LENS-PROXY]: Proxy server has started at ${address}:${port}`);

          proxyServer.on("error", (error) => {
            logger.info(`[LENS-PROXY]: Subsequent error: ${error}`);
          });

          emitAppEvent({ name: "lens-proxy", action: "listen", params: { port }});
          resolve(port);
        })
        .once("error", onInitialError);
    });

    const listen = async () => {
      const seenPorts = new Set<number>();

      for(;;) {
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

    const close = () => {
      logger.info("[LENS-PROXY]: Closing server");

      proxyServer.close();
      handleLensRequest.stopHandling();
    };

    return { close, listen };
  },
  causesSideEffects: true,
});

export default lensProxyInjectable;
