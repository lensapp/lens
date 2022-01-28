/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import type { IComputedValue } from "mobx";
import request, { RequestPromiseOptions } from "request-promise-native";
import type { Cluster } from "../../common/cluster/cluster";
import { bind } from "../../common/utils";
import { apiKubePrefix } from "../../common/vars";
import getProxyPortInjectable from "../lens-proxy/get-proxy-port.injectable";

interface Dependencies {
  proxyPort: IComputedValue<number>;
}

function k8sRequest({ proxyPort }: Dependencies, cluster: Cluster, path: string, options: RequestPromiseOptions = {}): Promise<any> {
  const kubeProxyUrl = `http://localhost:${proxyPort.get()}${apiKubePrefix}`;

  options.headers ??= {};
  options.json ??= true;
  options.timeout ??= 30000;
  options.headers.Host = `${cluster.id}.${new URL(kubeProxyUrl).host}`; // required in ClusterManager.getClusterForRequest()

  return request(kubeProxyUrl + path, options);
}

const k8sRequestInjectable = getInjectable({
  instantiate: (di) => bind(k8sRequest, null, {
    proxyPort: di.inject(getProxyPortInjectable),
  }),
  lifecycle: lifecycleEnum.singleton,
});

export default k8sRequestInjectable;
