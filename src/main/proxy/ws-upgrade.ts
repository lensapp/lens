/**
 * This file is here so that the "../shell-session" import can be injected into
 * LensProxy at creation time. So that the `pty.node` extension isn't loaded
 * into Lens Extension webpack bundle.
 */

import * as WebSocket from "ws";
import http from "http";
import net from "net";
import url from "url";
import { NodeShellSession, LocalShellSession } from "../shell-session";
import { ClusterManager } from "../cluster-manager";
import logger from "../logger";

function createWsListener(): WebSocket.Server {
  const ws = new WebSocket.Server({ noServer: true });

  return ws.on("connection", ((socket: WebSocket, req: http.IncomingMessage) => {
    const cluster = ClusterManager.getInstance().getClusterForRequest(req);
    const nodeParam = url.parse(req.url, true).query["node"]?.toString();
    const shell = nodeParam
      ? new NodeShellSession(socket, cluster, nodeParam)
      : new LocalShellSession(socket, cluster);

    shell.open()
      .catch(error => logger.error(`[SHELL-SESSION]: failed to open: ${error}`, { error }));
  }));
}

export async function handleWsUpgrade(req: http.IncomingMessage, socket: net.Socket, head: Buffer) {
  const wsServer = createWsListener();

  wsServer.handleUpgrade(req, socket, head, (con) => {
    wsServer.emit("connection", con, req);
  });
}
