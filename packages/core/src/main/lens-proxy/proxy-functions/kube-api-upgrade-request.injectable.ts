/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { chunk } from "lodash";
import type { ConnectionOptions } from "tls";
import { connect } from "tls";
import url, { URL } from "url";
import { apiKubePrefix } from "../../../common/vars";
import { getInjectable } from "@ogre-tools/injectable";
import kubeAuthProxyServerInjectable from "../../cluster/kube-auth-proxy-server.injectable";
import kubeAuthProxyCertificateInjectable from "../../kube-auth-proxy/kube-auth-proxy-certificate.injectable";
import type { LensProxyApiRequest } from "./types";

const skipRawHeaders = new Set(["Host", "Authorization"]);

const kubeApiUpgradeRequestInjectable = getInjectable({
  id: "kube-api-upgrade-request",
  instantiate: (di): LensProxyApiRequest => async ({ req, socket, head, cluster }) => {
    const clusterUrl = new URL(cluster.apiUrl.get());
    const kubeAuthProxyServer = di.inject(kubeAuthProxyServerInjectable, cluster);
    const kubeAuthProxyCertificate = di.inject(kubeAuthProxyCertificateInjectable, clusterUrl.hostname);

    const proxyUrl = await kubeAuthProxyServer.ensureAuthProxyUrl() + req.url.replace(apiKubePrefix, "");
    const apiUrl = url.parse(cluster.apiUrl.get());
    const pUrl = url.parse(proxyUrl);
    const connectOpts: ConnectionOptions = {
      port: pUrl.port ? parseInt(pUrl.port) : undefined,
      host: pUrl.hostname ?? undefined,
      ca: kubeAuthProxyCertificate.cert,
    };

    const proxySocket = connect(connectOpts, () => {
      proxySocket.write(`${req.method} ${pUrl.path} HTTP/1.1\r\n`);
      proxySocket.write(`Host: ${apiUrl.host}\r\n`);

      for (const [key, value] of chunk(req.rawHeaders, 2)) {
        if (skipRawHeaders.has(key)) {
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
});

export default kubeApiUpgradeRequestInjectable;

