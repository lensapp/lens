/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import openShellSessionInjectable from "../../../shell-session/create-shell-session.injectable";
import getClusterForRequestInjectable from "../../get-cluster-for-request.injectable";
import { WebSocketServer } from "ws";
import { URL } from "url";
import loggerInjectable from "../../../../common/logger.injectable";
import type { ProxyApiRequestHandler } from "../../lens-proxy";
import authenticateShellRequestInjectable from "./authenticate.injectable";

const shellApiRequestInjectable = getInjectable({
  id: "shell-api-request",

  instantiate: (di): ProxyApiRequestHandler => {
    const openShellSession = di.inject(openShellSessionInjectable);
    const authenticateShellRequest = di.inject(authenticateShellRequestInjectable);
    const getClusterForRequest = di.inject(getClusterForRequestInjectable);
    const logger = di.inject(loggerInjectable);

    return ({ req, socket, head }) => {
      const cluster = getClusterForRequest(req);
      const { searchParams } = new URL(req.url, "http://localhost");
      const nodeName = searchParams.get("node");
      const shellToken = searchParams.get("shellToken");
      const tabId = searchParams.get("id");

      if (!tabId || !cluster || !authenticateShellRequest(cluster.id, tabId, shellToken)) {
        socket.write("Invalid shell request");
        socket.end();
      } else {
        new WebSocketServer({ noServer: true })
          .handleUpgrade(req, socket, head, (websocket) => {
            openShellSession({ websocket, cluster, tabId, nodeName })
              .catch(error => logger.error(`[SHELL-SESSION]: failed to open a ${nodeName ? "node" : "local"} shell`, error));
          });
      }
    };
  },
});

export default shellApiRequestInjectable;
