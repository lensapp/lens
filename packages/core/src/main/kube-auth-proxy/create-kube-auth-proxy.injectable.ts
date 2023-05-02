/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import type { Cluster } from "../../common/cluster/cluster";
import spawnInjectable from "../child-process/spawn.injectable";
import { loggerInjectionToken } from "@k8slens/logger";
import waitUntilPortIsUsedInjectable from "./wait-until-port-is-used/wait-until-port-is-used.injectable";
import lensK8sProxyPathInjectable from "./lens-k8s-proxy-path.injectable";
import getPortFromStreamInjectable from "../utils/get-port-from-stream.injectable";
import getDirnameOfPathInjectable from "../../common/path/get-dirname.injectable";
import randomBytesInjectable from "../../common/utils/random-bytes.injectable";
import type { ChildProcess } from "child_process";
import { observable, when } from "mobx";
import assert from "assert";
import clusterApiUrlInjectable from "../../features/cluster/connections/main/api-url.injectable";
import kubeAuthProxyCertificateInjectable from "./kube-auth-proxy-certificate.injectable";
import broadcastConnectionUpdateInjectable from "../cluster/broadcast-connection-update.injectable";
import { TypedRegEx } from "typed-regex";

export interface KubeAuthProxy {
  readonly apiPrefix: string;
  readonly port: number;
  run: () => Promise<void>;
  exit: () => void;
}

export type CreateKubeAuthProxy = (env: NodeJS.ProcessEnv) => KubeAuthProxy;

const startingServeMatcher = "starting to serve on (?<address>.+)";
const startingServeRegex = Object.assign(TypedRegEx(startingServeMatcher, "i"), {
  rawMatcher: startingServeMatcher,
});

const createKubeAuthProxyInjectable = getInjectable({
  id: "create-kube-auth-proxy",

  instantiate: (di, cluster): CreateKubeAuthProxy => {
    const lensK8sProxyPath = di.inject(lensK8sProxyPathInjectable);
    const spawn = di.inject(spawnInjectable);
    const logger = di.inject(loggerInjectionToken);
    const waitUntilPortIsUsed = di.inject(waitUntilPortIsUsedInjectable);
    const getPortFromStream = di.inject(getPortFromStreamInjectable);
    const getDirnameOfPath = di.inject(getDirnameOfPathInjectable);
    const randomBytes = di.inject(randomBytesInjectable);
    const clusterApiUrl = di.inject(clusterApiUrlInjectable, cluster);
    const broadcastConnectionUpdate = di.inject(broadcastConnectionUpdateInjectable, cluster);

    return (env) => {
      let port: number | undefined;
      let proxyProcess: ChildProcess | undefined;
      const ready = observable.box(false);
      const apiPrefix = `/${randomBytes(8).toString("hex")}`;

      const exit = () => {
        ready.set(false);

        if (proxyProcess) {
          logger.debug("[KUBE-AUTH]: stopping local proxy", cluster.getMeta());
          proxyProcess.removeAllListeners();
          proxyProcess.stderr?.removeAllListeners();
          proxyProcess.stdout?.removeAllListeners();
          proxyProcess.kill();
          proxyProcess = undefined;
        }
      };

      const run = async (): Promise<void> => {
        if (proxyProcess) {
          return when(() => ready.get());
        }

        const apiUrl = await clusterApiUrl();
        const certificate = di.inject(kubeAuthProxyCertificateInjectable, apiUrl.hostname);

        proxyProcess = spawn(lensK8sProxyPath, [], {
          env: {
            ...env,
            KUBECONFIG: cluster.kubeConfigPath.get(),
            KUBECONFIG_CONTEXT: cluster.contextName.get(),
            API_PREFIX: apiPrefix,
            PROXY_KEY: certificate.private,
            PROXY_CERT: certificate.cert,
          },
          cwd: getDirnameOfPath(cluster.kubeConfigPath.get()),
        });
        proxyProcess.on("error", (error) => {
          broadcastConnectionUpdate({
            level: "error",
            message: error.message,
          });
          exit();
        });

        proxyProcess.on("exit", (code) => {
          if (code) {
            broadcastConnectionUpdate({
              level: "error",
              message: `proxy exited with code: ${code}`,
            });
          } else {
            broadcastConnectionUpdate({
              level: "info",
              message: "proxy exited successfully",
            });
          }
          exit();
        });

        proxyProcess.on("disconnect", () => {
          broadcastConnectionUpdate({
            level: "error",
            message: "Proxy disconnected communications",
          });
          exit();
        });

        assert(proxyProcess.stderr);
        assert(proxyProcess.stdout);

        proxyProcess.stderr.on("data", (data: Buffer) => {
          if (data.includes("http: TLS handshake error")) {
            return;
          }

          broadcastConnectionUpdate({
            level: "error",
            message: data.toString(),
          });
        });

        proxyProcess.stdout.on("data", (data: Buffer) => {
          if (typeof port === "number") {
            broadcastConnectionUpdate({
              level: "info",
              message: data.toString(),
            });
          }
        });

        port = await getPortFromStream(proxyProcess.stdout, {
          lineRegex: startingServeRegex,
          onFind: () => broadcastConnectionUpdate({
            level: "info",
            message: "Authentication proxy started",
          }),
        });

        logger.info(`[KUBE-AUTH-PROXY]: found port=${port}`);

        try {
          await waitUntilPortIsUsed(port, 500, 10000);
          ready.set(true);
        } catch (error) {
          logger.warn("[KUBE-AUTH-PROXY]: waitUntilUsed failed", error);
          broadcastConnectionUpdate({
            level: "error",
            message: "Proxy port failed to be used within time limit, restarting...",
          });
          exit();

          return run();
        }
      };

      return {
        apiPrefix,
        exit,
        run,
        get port() {
          assert(port, "port has not yet been initialized");

          return port;
        },
      };
    };
  },
  lifecycle: lifecycleEnum.keyedSingleton({
    getInstanceKey: (di, cluster: Cluster) => cluster.id,
  }),
});

export default createKubeAuthProxyInjectable;
