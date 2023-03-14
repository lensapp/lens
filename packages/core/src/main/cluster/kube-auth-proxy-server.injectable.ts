/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { ServerOptions } from "http-proxy";
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import type { Cluster } from "../../common/cluster/cluster";
import createKubeAuthProxyInjectable from "../kube-auth-proxy/create-kube-auth-proxy.injectable";
import kubeAuthProxyCertificateInjectable from "../kube-auth-proxy/kube-auth-proxy-certificate.injectable";
import type { KubeAuthProxy } from "../kube-auth-proxy/kube-auth-proxy";

export interface KubeAuthProxyServer {
  getApiTarget(isLongRunningRequest?: boolean): Promise<ServerOptions>;
  ensureAuthProxyUrl(): Promise<string>;
  ensureRunning(): Promise<void>;
  stop(): void;
}

const fourHoursInMs = 4 * 60 * 60  * 1000;
const thirtySecondsInMs = 30 * 1000;

const kubeAuthProxyServerInjectable = getInjectable({
  id: "kube-auth-proxy-server",
  instantiate: (di, cluster): KubeAuthProxyServer => {
    const clusterUrl = new URL(cluster.apiUrl.get());

    const createKubeAuthProxy = di.inject(createKubeAuthProxyInjectable);
    const certificate = di.inject(kubeAuthProxyCertificateInjectable, clusterUrl.hostname);

    let kubeAuthProxy: KubeAuthProxy | undefined = undefined;
    let apiTarget: ServerOptions | undefined = undefined;

    const ensureServerHelper = async (): Promise<KubeAuthProxy> => {
      if (!kubeAuthProxy) {
        const proxyEnv = Object.assign({}, process.env);

        if (cluster.preferences.httpsProxy) {
          proxyEnv.HTTPS_PROXY = cluster.preferences.httpsProxy;
        }

        kubeAuthProxy = createKubeAuthProxy(cluster, proxyEnv);
      }

      await kubeAuthProxy.run();

      return kubeAuthProxy;
    };

    const newApiTarget = async (timeout: number): Promise<ServerOptions> => {
      const kubeAuthProxy = await ensureServerHelper();
      const headers: Record<string, string> = {};

      if (clusterUrl.hostname) {
        headers.Host = clusterUrl.hostname;

        // fix current IPv6 inconsistency in url.Parse() and httpProxy.
        // with url.Parse the IPv6 Hostname has no Square brackets but httpProxy needs the Square brackets to work.
        if (headers.Host.includes(":")) {
          headers.Host = `[${headers.Host}]`;
        }
      }

      return {
        target: {
          protocol: "https:",
          host: "127.0.0.1",
          port: kubeAuthProxy.port,
          path: kubeAuthProxy.apiPrefix,
          ca: certificate.cert,
        },
        changeOrigin: true,
        timeout,
        secure: true,
        headers,
      };
    };

    const stopServer = () => {
      kubeAuthProxy?.exit();
      kubeAuthProxy = undefined;
      apiTarget = undefined;
    };

    return {
      getApiTarget: async (isLongRunningRequest = false) => {
        if (isLongRunningRequest) {
          return newApiTarget(fourHoursInMs);
        }

        return apiTarget ??= await newApiTarget(thirtySecondsInMs);
      },
      ensureAuthProxyUrl: async () => {
        const kubeAuthProxy = await ensureServerHelper();

        return `https://127.0.0.1:${kubeAuthProxy.port}${kubeAuthProxy.apiPrefix}`;
      },
      ensureRunning: async () => {
        await ensureServerHelper();
      },
      stop: stopServer,
    };
  },
  lifecycle: lifecycleEnum.keyedSingleton({
    getInstanceKey: (di, cluster: Cluster) => cluster.id,
  }),
});

export default kubeAuthProxyServerInjectable;
