/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import logger from "../../logger";
import type WebSocket from "ws";
import { Server as WebSocketServer } from "ws";
import type { ProxyApiRequestArgs } from "../types";
import { ClusterManager } from "../../cluster-manager";
import URLParse from "url-parse";
import type { Cluster } from "../../../common/cluster/cluster";
import type { ClusterId } from "../../../common/cluster-types";

interface Dependencies {
  authenticateRequest: (clusterId: ClusterId, tabId: string, shellToken: string | undefined) => boolean;

  createShellSession: (args: {
    webSocket: WebSocket;
    cluster: Cluster;
    tabId: string;
    nodeName?: string;
  }) => { open: () => Promise<void> };
}

export const shellApiRequest = ({ createShellSession, authenticateRequest }: Dependencies) => ({ req, socket, head }: ProxyApiRequestArgs): void => {
  const cluster = ClusterManager.getInstance().getClusterForRequest(req);
  const { query: { node: nodeName, shellToken, id: tabId }} = new URLParse(req.url, true);

  if (!tabId || !cluster || !authenticateRequest(cluster.id, tabId, shellToken)) {
    socket.write("Invalid shell request");

    return void socket.end();
  }

  const ws = new WebSocketServer({ noServer: true });

  ws.handleUpgrade(req, socket, head, (webSocket) => {
    const shell = createShellSession({ webSocket, cluster, tabId, nodeName });

    shell.open()
      .catch(error => logger.error(`[SHELL-SESSION]: failed to open a ${nodeName ? "node" : "local"} shell`, error));
  });
};
