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

import net from "net";
import url from "url";
import { apiKubePrefix } from "../../common/vars";
import { ClusterManager } from "../cluster-manager";
import type { ProxyApiRequestArgs } from "./types";

export async function kubeApiRequest({ req, socket, head }: ProxyApiRequestArgs) {
  const cluster = ClusterManager.getInstance().getClusterForRequest(req);
  
  if (!cluster) {
    return;
  }

  const proxyUrl = await cluster.contextHandler.resolveAuthProxyUrl() + req.url.replace(apiKubePrefix, "");
  const apiUrl = url.parse(cluster.apiUrl);
  const pUrl = url.parse(proxyUrl);
  const connectOpts = { port: parseInt(pUrl.port), host: pUrl.hostname };
  const proxySocket = new net.Socket();

  proxySocket.connect(connectOpts, () => {
    proxySocket.write(`${req.method} ${pUrl.path} HTTP/1.1\r\n`);
    proxySocket.write(`Host: ${apiUrl.host}\r\n`);

    for (let i = 0; i < req.rawHeaders.length; i += 2) {
      const key = req.rawHeaders[i];

      if (key !== "Host" && key !== "Authorization") {
        proxySocket.write(`${req.rawHeaders[i]}: ${req.rawHeaders[i + 1]}\r\n`);
      }
    }
    proxySocket.write("\r\n");
    proxySocket.write(head);
  });

  proxySocket.setKeepAlive(true);
  socket.setKeepAlive(true);
  proxySocket.setTimeout(0);
  socket.setTimeout(0);

  proxySocket.on("data", function (chunk) {
    socket.write(chunk);
  });
  proxySocket.on("end", function () {
    socket.end();
  });
  proxySocket.on("error", function () {
    socket.write(`HTTP/${req.httpVersion} 500 Connection error\r\n\r\n`);
    socket.end();
  });
  socket.on("data", function (chunk) {
    proxySocket.write(chunk);
  });
  socket.on("end", function () {
    proxySocket.end();
  });
  socket.on("error", function () {
    proxySocket.end();
  });
}
