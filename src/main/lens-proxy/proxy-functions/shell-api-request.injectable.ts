/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { URL } from "url";
import { WebSocketServer } from "ws";
import loggerInjectable from "../../../common/logger.injectable";
import shellApiAuthenticatorInjectable from "../../../features/terminal/main/shell-api-authenticator.injectable";
import clusterManagerInjectable from "../../cluster/manager.injectable";
import openShellSessionInjectable from "../../shell-session/create-shell-session.injectable";
import getClusterForRequestInjectable from "../get-cluster-for-request.injectable";
import type { ProxyApiRequestArgs } from "./types";

const shellApiRequestInjectable = getInjectable({
  id: "shell-api-request",

  instantiate: (di) => {
    const openShellSession = di.inject(openShellSessionInjectable);
    const clusterManager = di.inject(clusterManagerInjectable);
    const logger = di.inject(loggerInjectable);
    const shellApiAuthenticator = di.inject(shellApiAuthenticatorInjectable);
    const getClusterForRequest = di.inject(getClusterForRequestInjectable);

    return ({ req, socket, head }: ProxyApiRequestArgs): void => {
      const cluster = getClusterForRequest(req);
      const { searchParams } = new URL(req.url);
      const tabId = searchParams.get("id");
      const nodeName = searchParams.get("node");
      const shellToken = searchParams.get("shellToken");

      if (!tabId || !cluster || !shellApiAuthenticator.authenticate(cluster.id, tabId, shellToken)) {
        socket.write("Invalid shell request");

        return void socket.end();
      }

      const ws = new WebSocketServer({ noServer: true });

      ws.handleUpgrade(req, socket, head, (websocket) => {
        openShellSession({ websocket, cluster, tabId, nodeName })
          .catch(error => logger.error(`[SHELL-SESSION]: failed to open a ${nodeName ? "node" : "local"} shell`, error));
      });
    };
  },
});

export default shellApiRequestInjectable;
