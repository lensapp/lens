/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import authenticateShellRequestInjectable from "./shell-request-authenticator.injectable";
import openShellSessionInjectable from "../../shell-session/create-shell-session.injectable";
import URLParse from "url-parse";
import { Server as WebSocketServer } from "ws";
import loggerInjectable from "../../../common/logger.injectable";
import getClusterForRequestInjectable from "../get-cluster-for-request.injectable";
import { lensProxyUpgradeRouteInjectionToken } from "./proxy-upgrade-route";
import { apiPrefix } from "../../../common/vars";

const shellApiUpgradeRouteInjectable = getInjectable({
  id: "shell-api-request",

  instantiate: (di) => {
    const openShellSession = di.inject(openShellSessionInjectable);
    const authenticateShellRequest = di.inject(authenticateShellRequestInjectable);
    const getClusterForRequest = di.inject(getClusterForRequestInjectable);
    const logger = di.inject(loggerInjectable);

    return {
      handler: ({ req, socket, head }) => {
        const cluster = getClusterForRequest(req);
        const { query: { node: nodeName, shellToken, id: tabId }} = new URLParse(req.url, true);

        if (!tabId || !cluster || !authenticateShellRequest(cluster.id, tabId, shellToken)) {
          socket.write("Invalid shell request");
          socket.end();
        } else {
          const ws = new WebSocketServer({ noServer: true });

          ws.handleUpgrade(req, socket, head, (websocket) => {
            openShellSession({ websocket, cluster, tabId, nodeName })
              .catch(error => logger.error(`[SHELL-SESSION]: failed to open a ${nodeName ? "node" : "local"} shell`, error));
          });
        }
      },
      path: apiPrefix,
    };
  },
  injectionToken: lensProxyUpgradeRouteInjectionToken,
});

export default shellApiUpgradeRouteInjectable;
