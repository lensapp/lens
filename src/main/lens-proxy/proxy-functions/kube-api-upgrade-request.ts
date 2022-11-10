/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { chunk } from "lodash";
import type { ConnectionOptions } from "tls";
import { connect } from "tls";
import url from "url";
import { apiKubePrefix } from "../../../common/vars";
import type { ProxyApiRequestHandler } from "../lens-proxy";

const skipRawHeaders = new Set(["Host", "Authorization"]);

export const kubeApiUpgradeRequest: ProxyApiRequestHandler = async ({ req, socket, head, cluster }) => {
  const proxyUrl = await cluster.contextHandler.resolveAuthProxyUrl() + req.url.replace(apiKubePrefix, "");
  const proxyCa = cluster.contextHandler.resolveAuthProxyCa();
  const apiUrl = url.parse(cluster.apiUrl);
  const pUrl = url.parse(proxyUrl);
  const connectOpts: ConnectionOptions = {
    port: pUrl.port ? parseInt(pUrl.port) : undefined,
    host: pUrl.hostname ?? undefined,
    ca: proxyCa,
  };

  const proxySocket = connect(connectOpts, () => {
    const headers = chunk(req.rawHeaders, 2)
      .filter(([key]) => !skipRawHeaders.has(key))
      .map(([key, value]) => `${key}: ${value}`)
      .join("\r\n");

    proxySocket.write(`${req.method} ${pUrl.path} HTTP/1.1\r\n`);
    proxySocket.write(`Host: ${apiUrl.host}\r\n`);
    proxySocket.write(`${headers}\r\n`);
    proxySocket.write(head);
  });

  proxySocket.setKeepAlive(true);
  socket.setKeepAlive(true);
  proxySocket.setTimeout(0);
  socket.setTimeout(0);

  proxySocket.on("data", chunk => socket.write(chunk));
  proxySocket.on("end", () => socket.end());
  proxySocket.on("error", () => {
    socket.write(`HTTP/${req.httpVersion} 500 Connection error\r\n\r\n`);
    socket.end();
  });
  socket.on("data", (chunk) => proxySocket.write(chunk));
  socket.on("end", () => proxySocket.end());
  socket.on("error", () => proxySocket.end());
};
