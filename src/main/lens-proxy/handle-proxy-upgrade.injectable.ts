/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { IncomingMessage } from "http";
import type { Socket } from "net";
import type { SetRequired } from "type-fest";
import loggerInjectable from "../../common/logger.injectable";
import { apiPrefix, apiKubePrefix } from "../../common/vars";
import authHeaderStateInjectable from "../../features/auth-header/common/header-state.injectable";
import { lensAuthHeaderName } from "../../features/auth-header/common/vars";
import getClusterForRequestInjectable from "./get-cluster-for-request.injectable";
import { kubeApiUpgradeRequest } from "./proxy-functions";
import shellApiRequestInjectable from "./proxy-functions/shell-api-request.injectable";

const handleProxyUpgradeRequestInjectable = getInjectable({
  id: "handle-proxy-upgrade-request",
  instantiate: (di) => {
    const getClusterForRequest = di.inject(getClusterForRequestInjectable);
    const shellApiRequest = di.inject(shellApiRequestInjectable);
    const logger = di.inject(loggerInjectable);
    const authHeaderValue = `Bearer ${di.inject(authHeaderStateInjectable).get()}`;

    return (req: SetRequired<IncomingMessage, "url" | "method">, socket: Socket, head: Buffer) => {
      const cluster = getClusterForRequest(req);
      const url = new URL(req.url, "https://localhost");

      if (url.searchParams.get(lensAuthHeaderName) !== authHeaderValue) {
        logger.warn(`[LENS-PROXY]: Request from url=${req.url} missing authentication`);
        socket.destroy();

        return;
      }

      if (!cluster) {
        logger.error(`[LENS-PROXY]: Could not find cluster for upgrade request from url=${req.url}`);
        socket.destroy();

        return;
      }

      (async () => {
        try {
          if (url.pathname === apiPrefix) {
            await shellApiRequest({ req, socket, cluster, head });
          } else if (url.pathname.startsWith(`${apiKubePrefix}/`)) {
            await kubeApiUpgradeRequest({ req, socket, cluster, head });
          } else {
            logger.warn(`[LENS-PROXY]: unknown upgrade request, url=${req.url}`);
          }
        } catch (error) {
          logger.error("[LENS-PROXY]: failed to handle proxy upgrade", error);
        }
      })();
    };
  },
});

export default handleProxyUpgradeRequestInjectable;
