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

import type http from "http";
import url from "url";
import logger from "../logger";
import * as WebSocket from "ws";
import { NodeShellSession, LocalShellSession } from "../shell-session";
import type { ProxyApiRequestArgs } from "./types";
import { ClusterManager } from "../cluster-manager";

export function shellApiRequest({ req, socket, head }: ProxyApiRequestArgs) {
  const ws = new WebSocket.Server({ noServer: true });

  ws.on("connection", ((socket: WebSocket, req: http.IncomingMessage) => {
    const cluster = ClusterManager.getInstance().getClusterForRequest(req);
    const nodeParam = url.parse(req.url, true).query["node"]?.toString();
    const shell = nodeParam
      ? new NodeShellSession(socket, cluster, nodeParam)
      : new LocalShellSession(socket, cluster);

    shell.open()
      .catch(error => logger.error(`[SHELL-SESSION]: failed to open: ${error}`, { error }));
  }));

  ws.handleUpgrade(req, socket, head, (con) => {
    ws.emit("connection", con, req);
  });
}
