/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import URLParse from "url-parse";
import getClusterForRequestInjectable from "../../cluster/get-cluster-for-request.injectable";
import type { LensProxyRequestHandler } from "../lens-proxy";
import createShellSessionInjectable from "../../shell-session/create-shell-session.injectable";
import authenticateShellApiRequestInjectable from "./request/authenticate.injectable";
import { Server as WebSocketServer } from "ws";
import shellApiRequestLoggerInjectable from "./logger.injectable";

const shellApiRequestHandlerInjectable = getInjectable({
  id: "shell-api-request-handler",
  instantiate: (di): LensProxyRequestHandler => {
    const createShellSession = di.inject(createShellSessionInjectable);
    const authenticateShellApiRequest = di.inject(authenticateShellApiRequestInjectable);
    const getClusterForRequest = di.inject(getClusterForRequestInjectable);
    const logger = di.inject(shellApiRequestLoggerInjectable);

    return ({ req, socket, head }) => {
      const cluster = getClusterForRequest(req);
      const { query: { node: nodeName, shellToken, id: tabId }} = new URLParse(req.url, true);

      if (!cluster || !authenticateShellApiRequest(cluster.id, tabId, shellToken)) {
        return void socket.end("Invalid shell request");
      }

      const ws = new WebSocketServer({ noServer: true });

      ws.handleUpgrade(req, socket, head, (webSocket) => {
        const shell = createShellSession({ webSocket, cluster, tabId, nodeName });

        shell.open()
          .catch(error => logger.error(`failed to open a ${nodeName ? "node" : "local"} shell`, error));
      });
    };
  },
});

export default shellApiRequestHandlerInjectable;
