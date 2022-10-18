/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { URL } from "url";
import { WebSocketServer } from "ws";
import loggerInjectable from "../../../common/logger.injectable";
import shellApiAuthenticatorInjectable from "../../../features/terminal/main/shell-api-authenticator.injectable";
import openShellSessionInjectable from "../../shell-session/create-shell-session.injectable";
import getClusterForRequestInjectable from "../get-cluster-for-request.injectable";
import type { ProxyRequestHandler } from "../lens-proxy";

const shellApiRequestInjectable = getInjectable({
  id: "shell-api-request",

  instantiate: (di): ProxyRequestHandler => {
    const openShellSession = di.inject(openShellSessionInjectable);
    const getClusterForRequest = di.inject(getClusterForRequestInjectable);
    const logger = di.inject(loggerInjectable);
    const shellApiAuthenticator = di.inject(shellApiAuthenticatorInjectable);

    return ({ req, socket, head }) => {
      const cluster = getClusterForRequest(req);
      const { searchParams } = new URL(req.url, `https://${req.headers.host}`);
      const tabId = searchParams.get("id");
      const nodeName = searchParams.get("node");
      const shellToken = searchParams.get("shellToken");

      if (!tabId || !cluster || !shellApiAuthenticator.authenticate(cluster.id, tabId, shellToken)) {
        socket.write("Invalid shell request");
        socket.end();
      } else {
        new WebSocketServer({ noServer: true })
          .handleUpgrade(req, socket, head, (websocket) => {
            (async () => {
              try {
                await openShellSession({ websocket, cluster, tabId, nodeName });
              } catch (error) {
                logger.error(`[SHELL-SESSION]: failed to open a ${nodeName ? "node" : "local"} shell`, error);
              }
            })();
          });
      }
    };
  },
});

export default shellApiRequestInjectable;
