/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { Cluster } from "../../common/cluster/cluster";
import type { KubeAuthProxyProcess } from "./spawn-proxy.injectable";
import spawnKubeAuthProxyInjectable from "./spawn-proxy.injectable";
import type { IObservableValue } from "mobx";
import { observable } from "mobx";
import { getOrInsertWithObservable } from "../../common/utils";

export interface KubeAuthProxy {
  readonly proxyProcess: IObservableValue<KubeAuthProxyProcess | undefined>;
  run(): Promise<KubeAuthProxyProcess>;
  exit(): void;
}

export type CreateKubeAuthProxy = (cluster: Cluster) => KubeAuthProxy;

const createKubeAuthProxyInjectable = getInjectable({
  id: "create-kube-auth-proxy",

  instantiate: (di): CreateKubeAuthProxy => {
    const spawnKubeAuthProxy = di.inject(spawnKubeAuthProxyInjectable);

    return (cluster) => {
      const proxyProcess = observable.box<KubeAuthProxyProcess>();
      let controller = new AbortController();

      return {
        proxyProcess,
        run: () => getOrInsertWithObservable(proxyProcess, async () => {
          controller = new AbortController();

          return spawnKubeAuthProxy(cluster, {
            signal: controller.signal,
          });
        }),
        exit: () => {
          controller.abort();
          proxyProcess.get()?.stop();
          proxyProcess.set(undefined);
        },
      };
    };
  },
});

export default createKubeAuthProxyInjectable;
