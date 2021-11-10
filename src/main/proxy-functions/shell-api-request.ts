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

import logger from "../../common/logger";
import { Server as WebSocketServer } from "ws";
import { NodeShellSession, LocalShellSession } from "../shell-session";
import type { ProxyApiRequestArgs } from "./types";
import { ClusterManager } from "../cluster-manager";
import URLParse from "url-parse";
import { ExtendedMap, Singleton } from "../../common/utils";
import type { ClusterId } from "../../common/cluster-types";
import { ipcMainHandle } from "../../common/ipc";
import crypto from "crypto";
import { promisify } from "util";

const randomBytes = promisify(crypto.randomBytes);

export class ShellRequestAuthenticator extends Singleton {
  private tokens = new ExtendedMap<ClusterId, Map<string, Uint8Array>>();

  init() {
    ipcMainHandle("cluster:shell-api", async (event, clusterId, tabId) => {
      const authToken = Uint8Array.from(await randomBytes(128));

      this.tokens
        .getOrInsert(clusterId, () => new Map())
        .set(tabId, authToken);

      return authToken;
    });
  }

  /**
   * Authenticates a single use token for creating a new shell
   * @param clusterId The `ClusterId` for the shell
   * @param tabId The ID for the shell
   * @param token The value that is being presented as a one time authentication token
   * @returns `true` if `token` was valid, false otherwise
   */
  authenticate(clusterId: ClusterId, tabId: string, token: string): boolean {
    const clusterTokens = this.tokens.get(clusterId);

    if (!clusterTokens) {
      return false;
    }

    const authToken = clusterTokens.get(tabId);
    const buf = Uint8Array.from(Buffer.from(token, "base64"));

    if (authToken instanceof Uint8Array && authToken.length === buf.length && crypto.timingSafeEqual(authToken, buf)) {
      // remove the token because it is a single use token
      clusterTokens.delete(tabId);

      return true;
    }

    return false;
  }
}

export function shellApiRequest({ req, socket, head }: ProxyApiRequestArgs): void {
  const cluster = ClusterManager.getInstance().getClusterForRequest(req);
  const { query: { node, shellToken, id: tabId }} = new URLParse(req.url, true);

  if (!cluster || !ShellRequestAuthenticator.getInstance().authenticate(cluster.id, tabId, shellToken)) {
    socket.write("Invalid shell request");

    return void socket.end();
  }

  const ws = new WebSocketServer({ noServer: true });

  ws.handleUpgrade(req, socket, head, (webSocket) => {
    const shell = node
      ? new NodeShellSession(webSocket, cluster, node, tabId)
      : new LocalShellSession(webSocket, cluster, tabId);

    shell.open()
      .catch(error => logger.error(`[SHELL-SESSION]: failed to open a ${node ? "node" : "local"} shell`, error));
  });
}
