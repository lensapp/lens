/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { ConnectionOptions } from "tls";
import { connect } from "tls";
import url from "url";
import { chunkSkipEnd } from "../../../common/utils/chunk";
import { apiKubePrefix } from "../../../common/vars";

const skipRawHeaders = new Set(["host", "authorization"]);

import { getInjectable } from "@ogre-tools/injectable";
import { lensProxyUpgradeRouteInjectionToken } from "./proxy-upgrade-route";

const kubeApiUpgradeRouteInjectable = getInjectable({
  id: "kube-api-upgrade-route",
  instantiate: () => ({
    handler: async ({ req, socket, head, cluster }) => {
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
        proxySocket.write(`${req.method} ${pUrl.path} HTTP/1.1\r\n`);
        proxySocket.write(`Host: ${apiUrl.host}\r\n`);

        for (const [key, value] of chunkSkipEnd(req.rawHeaders, 2)) {
          if (skipRawHeaders.has(key.toLowerCase())) {
            continue;
          }

          proxySocket.write(`${key}: ${value}\r\n`);
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
    },
    path: `${apiKubePrefix}/*`,
  }),
  injectionToken: lensProxyUpgradeRouteInjectionToken,
});

export default kubeApiUpgradeRouteInjectable;

