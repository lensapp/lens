/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import shellRequestAuthenticatorInjectable from "./shell-request-authenticator/shell-request-authenticator.injectable";
import openShellSessionInjectable from "../../shell-session/create-shell-session.injectable";
import type { LensProxyApiRequest } from "../lens-proxy";
import URLParse from "url-parse";
import { Server as WebSocketServer } from "ws";
import { loggerInjectionToken } from "@k8slens/logger";
import getClusterForRequestInjectable from "../get-cluster-for-request.injectable";

const shellApiRequestInjectable = getInjectable({
  id: "shell-api-request",

  instantiate: (di): LensProxyApiRequest => {
    const openShellSession = di.inject(openShellSessionInjectable);
    const authenticateRequest = di.inject(shellRequestAuthenticatorInjectable).authenticate;
    const getClusterForRequest = di.inject(getClusterForRequestInjectable);
    const logger = di.inject(loggerInjectionToken);

    return ({ req, socket, head }) => {
      const cluster = getClusterForRequest(req);
      const { query: { node: nodeName, shellToken, id: tabId }} = new URLParse(req.url, true);

      if (!tabId || !cluster || !authenticateRequest(cluster.id, tabId, shellToken)) {
        socket.write("Invalid shell request");
        socket.end();
      } else {
        const ws = new WebSocketServer({ noServer: true });

        ws.handleUpgrade(req, socket, head, (websocket) => {
          openShellSession({ websocket, cluster, tabId, nodeName })
            .catch(error => logger.error(`[SHELL-SESSION]: failed to open a ${nodeName ? "node" : "local"} shell`, error));
        });
      }
    };
  },
});

export default shellApiRequestInjectable;
