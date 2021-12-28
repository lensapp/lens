/**
 * Copyright (c) 2021 OpenLens Authors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import logger from "../../logger";
import WebSocket, { Server as WebSocketServer } from "ws";
import type { ProxyApiRequestArgs } from "../types";
import { ClusterManager } from "../../cluster-manager";
import URLParse from "url-parse";
import type { Cluster } from "../../../common/cluster/cluster";
import type { ClusterId } from "../../../common/cluster-types";

interface Dependencies {
  authenticateRequest: (clusterId: ClusterId, tabId: string, shellToken: string) => boolean,

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

  if (!cluster || !authenticateRequest(cluster.id, tabId, shellToken)) {
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
