/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectable } from "@ogre-tools/injectable";
import { randomBytes } from "crypto";
import process from "process";
import { TypedRegEx } from "typed-regex";
import type { Cluster } from "../../common/cluster/cluster";
import loggerInjectable from "../../common/logger.injectable";
import spawnInjectable from "../child-process/spawn.injectable";
import { getProxyEnv } from "../cluster/get-proxy-env";
import kubeAuthProxyCertificateInjectable from "./kube-auth-proxy-certificate.injectable";
import lensK8sProxyPathInjectable from "./lens-k8s-proxy-path.injectable";
import waitUntilPortIsUsedInjectable from "../../common/utils/wait-until-port-is-used/wait-until-port-is-used.injectable";
import getPortFromStreamInjectable from "../utils/get-port-from-stream.injectable";

export interface KubeAuthProxyProcess {
  readonly port: number;
  readonly apiPrefix: string;
  stop: () => void;
}

export interface SpawnKubeAuthProxyArgs {
  signal: AbortSignal;
}

export type SpawnKubeAuthProxy = (cluster: Cluster, args: SpawnKubeAuthProxyArgs) => Promise<KubeAuthProxyProcess>;

const startingServeMatcher = "starting to serve on (?<address>.+)";
const startingServeRegex = Object.assign(TypedRegEx(startingServeMatcher, "i"), {
  rawMatcher: startingServeMatcher,
});

const spawnKubeAuthProxyInjectable = getInjectable({
  id: "spawn-kube-auth-proxy",
  instantiate: (di): SpawnKubeAuthProxy => {
    const spawn = di.inject(spawnInjectable);
    const lensK8sProxyPath = di.inject(lensK8sProxyPathInjectable);
    const logger = di.inject(loggerInjectable);
    const waitUntilPortIsUsed = di.inject(waitUntilPortIsUsedInjectable);
    const getPortFromStream = di.inject(getPortFromStreamInjectable);

    return async (...params) => {
      const [cluster, { signal }] = params;
      const clusterUrl = new URL(cluster.apiUrl);
      const apiPrefix = `/${randomBytes(8).toString("hex")}`;
      const proxyCert = di.inject(kubeAuthProxyCertificateInjectable, clusterUrl.hostname);

      const attemptToStart = async (): Promise<KubeAuthProxyProcess> => {
        let port: number | undefined = undefined;

        const proxyProcess = spawn(lensK8sProxyPath, [], {
          env: {
            ...process.env,
            ...getProxyEnv(cluster),
            KUBECONFIG: cluster.kubeConfigPath,
            KUBECONFIG_CONTEXT: cluster.contextName,
            API_PREFIX: apiPrefix,
            PROXY_KEY: proxyCert.private,
            PROXY_CERT: proxyCert.cert,
          },
          signal,
        });

        const stopProxyProcess = () => {
          logger.debug("[KUBE-AUTH]: stopping local proxy", cluster.getMeta());
          proxyProcess.removeAllListeners();
          proxyProcess.stderr?.removeAllListeners();
          proxyProcess.stdout?.removeAllListeners();
          proxyProcess.kill();
        };

        proxyProcess
          .on("error", (error) => {
            cluster.broadcastConnectUpdate(error.message, true);
            stopProxyProcess();
          })
          .on("exit", (code) => {
            cluster.broadcastConnectUpdate(`proxy exited with code: ${code}`, code ? code > 0: false);
            stopProxyProcess();
          })
          .on("disconnect", () => {
            cluster.broadcastConnectUpdate("Proxy disconnected communications", true );
            stopProxyProcess();
          });

        proxyProcess.stderr.on("data", (data: Buffer) => {
          if (data.includes("http: TLS handshake error")) {
            return;
          }

          cluster.broadcastConnectUpdate(data.toString(), true);
        });

        proxyProcess.stdout.on("data", (data: Buffer) => {
          if (typeof port === "number") {
            cluster.broadcastConnectUpdate(data.toString());
          }
        });

        port = await getPortFromStream(proxyProcess.stdout, {
          lineRegex: startingServeRegex,
          onFind: () => cluster.broadcastConnectUpdate("Authentication proxy started"),
        });

        logger.info(`[KUBE-AUTH-PROXY]: found port=${port}`);

        try {
          await waitUntilPortIsUsed(port, 500, 10_000);
        } catch (error) {
          logger.warn("[KUBE-AUTH-PROXY]: waitUntilUsed failed", error);
          cluster.broadcastConnectUpdate("Proxy port failed to be used within timelimit, restarting...", true);
          stopProxyProcess();

          return attemptToStart();
        }

        return {
          port,
          stop: stopProxyProcess,
          apiPrefix,
        };
      };

      return attemptToStart();
    };
  },
  causesSideEffects: true,
});

export default spawnKubeAuthProxyInjectable;
