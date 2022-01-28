/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { ExtendedMap } from "../../../common/utils";
import type { ClusterId } from "../../../common/cluster-types";
import { ipcMainHandle } from "../../../common/ipc";
import crypto from "crypto";
import { promisify } from "util";
import { Server as WebSocketServer } from "ws";
import type { ProxyApiRequestArgs } from "../types";
import URLParse from "url-parse";
import type http from "http";
import type { Cluster } from "../../../common/cluster/cluster";
import logger from "../../logger";
import type { CreateShellSessionArgs } from "../../shell-sessions/create-shell-session.injectable";

const randomBytes = promisify(crypto.randomBytes);

interface ShellSession {
  open: () => Promise<void>;
}

interface Dependencies {
  getClusterForRequest: (req: http.IncomingMessage) => Cluster;
  createShellSession: (args: CreateShellSessionArgs) => ShellSession;
}

export class ShellRequestAuthenticator {
  private tokens = new ExtendedMap<ClusterId, Map<string, Uint8Array>>();

  constructor(protected readonly dependencies: Dependencies) {
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
  authenticate = (clusterId: ClusterId, tabId: string, token: string): boolean => {
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
  };

  shellApiRequest = ({ req, socket, head }: ProxyApiRequestArgs): void => {
    const cluster = this.dependencies.getClusterForRequest(req);
    const { query: { node: nodeName, shellToken, id: tabId }} = new URLParse(req.url, true);

    if (!cluster || !this.authenticate(cluster.id, tabId, shellToken)) {
      socket.write("Invalid shell request");

      return void socket.end();
    }

    const ws = new WebSocketServer({ noServer: true });

    ws.handleUpgrade(req, socket, head, (websocket) => {
      this.dependencies.createShellSession({ websocket, cluster, tabId, nodeName })
        .open()
        .catch(error => logger.error(`[SHELL-SESSION]: failed to open a ${nodeName ? "node" : "local"} shell`, error));
    });
  };
}
