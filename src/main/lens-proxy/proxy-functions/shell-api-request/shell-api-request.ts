/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import logger from "../../../logger";
import { Server as WebSocketServer } from "ws";
import type { ProxyApiRequestArgs } from "../types";
import type { ClusterManager } from "../../../cluster/manager";
import URLParse from "url-parse";
import type { ClusterId } from "../../../../common/cluster-types";
import type { OpenShellSession } from "../../../shell-session/create-shell-session.injectable";

interface Dependencies {
  authenticateRequest: (clusterId: ClusterId, tabId: string, shellToken: string | undefined) => boolean;
  openShellSession: OpenShellSession;
  clusterManager: ClusterManager;
}

export const shellApiRequest = ({ openShellSession, authenticateRequest, clusterManager }: Dependencies) => ({ req, socket, head }: ProxyApiRequestArgs): void => {
  const cluster = clusterManager.getClusterForRequest(req);
  const { query: { node: nodeName, shellToken, id: tabId }} = new URLParse(req.url, true);

  if (!tabId || !cluster || !authenticateRequest(cluster.id, tabId, shellToken)) {
    socket.write("Invalid shell request");

    return void socket.end();
  }

  const ws = new WebSocketServer({ noServer: true });

  ws.handleUpgrade(req, socket, head, (websocket) => {
    openShellSession({ websocket, cluster, tabId, nodeName })
      .catch(error => logger.error(`[SHELL-SESSION]: failed to open a ${nodeName ? "node" : "local"} shell`, error));
  });
};
