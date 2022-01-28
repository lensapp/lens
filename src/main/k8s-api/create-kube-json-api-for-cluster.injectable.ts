/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import type { IComputedValue } from "mobx";
import { bind } from "../../common/utils";
import { apiKubePrefix, isDebugging } from "../../common/vars";
import { KubeJsonApi } from "../../common/k8s-api/kube-json-api";
import getProxyPortInjectable from "../lens-proxy/get-proxy-port.injectable";

interface Dependencies {
  proxyPort: IComputedValue<number>;
}

function createKubeJsonApiForCluster({ proxyPort }: Dependencies, clusterId: string): KubeJsonApi {
  const port = proxyPort.get();

  return new KubeJsonApi({
    serverAddress: `http://127.0.0.1:${port}`,
    apiBase: apiKubePrefix,
    debug: isDebugging,
  }, {
    headers: {
      "Host": `${clusterId}.localhost:${port}`,
    },
  });
}

const createKubeJsonApiForClusterInjectable = getInjectable({
  instantiate: (di) => bind(createKubeJsonApiForCluster, null, {
    proxyPort: di.inject(getProxyPortInjectable),
  }),
  lifecycle: lifecycleEnum.singleton,
});

export default createKubeJsonApiForClusterInjectable;
