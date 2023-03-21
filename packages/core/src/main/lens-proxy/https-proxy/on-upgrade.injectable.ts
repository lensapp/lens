/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { Socket } from "net";
import loggerInjectable from "../../../common/logger.injectable";
import { apiPrefix } from "../../../common/vars";
import getClusterForRequestInjectable from "../get-cluster-for-request.injectable";
import type { ProxyIncomingMessage } from "../messages";
import kubeApiUpgradeRequestInjectable from "../proxy-functions/kube-api-upgrade-request.injectable";
import shellApiRequestInjectable from "../proxy-functions/shell-api-request.injectable";

const lensProxyHttpsServerOnUpgradeInjectable = getInjectable({
  id: "lens-proxy-https-server-on-upgrade",
  instantiate: (di) => {
    const getClusterForRequest = di.inject(getClusterForRequestInjectable);
    const logger = di.inject(loggerInjectable);
    const shellApiRequest = di.inject(shellApiRequestInjectable);
    const kubeApiUpgradeRequest = di.inject(kubeApiUpgradeRequestInjectable);

    return (req: ProxyIncomingMessage, socket: Socket, head: Buffer) => {
      const cluster = getClusterForRequest(req);

      if (!cluster) {
        logger.error(`[LENS-PROXY]: Could not find cluster for upgrade request from url=${req.url}`);
        socket.destroy();
      } else {
        const isInternal = req.url.startsWith(`${apiPrefix}?`);
        const reqHandler = isInternal ? shellApiRequest : kubeApiUpgradeRequest;

        void (async () => {
          try {
            await reqHandler({ req, socket, head, cluster });
          } catch (error) {
            logger.error("[LENS-PROXY]: failed to handle proxy upgrade", error);
          }
        })();
      }
    };
  },
});

export default lensProxyHttpsServerOnUpgradeInjectable;
