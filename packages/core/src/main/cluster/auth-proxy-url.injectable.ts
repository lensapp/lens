/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import type { Cluster } from "../../common/cluster/cluster";
import lensProxyPortInjectable from "../lens-proxy/lens-proxy-port.injectable";

const kubeAuthProxyUrlInjectable = getInjectable({
  id: "kube-auth-proxy-url",
  instantiate: (di, cluster) => {
    const lensProxyPort = di.inject(lensProxyPortInjectable);

    return `https://127.0.0.1:${lensProxyPort.get()}/${cluster.id}`;
  },
  lifecycle: lifecycleEnum.keyedSingleton({
    getInstanceKey: (di, cluster: Cluster) => cluster.id,
  }),
});

export default kubeAuthProxyUrlInjectable;
