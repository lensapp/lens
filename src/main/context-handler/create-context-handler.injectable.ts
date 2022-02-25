/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { Cluster } from "../../common/cluster/cluster";
import { ContextHandler } from "./context-handler";
import createKubeAuthProxyInjectable from "../kube-auth-proxy/create-kube-auth-proxy.injectable";

const createContextHandlerInjectable = getInjectable({
  id: "create-context-handler",

  instantiate: (di) => {
    const dependencies = {
      createKubeAuthProxy: di.inject(createKubeAuthProxyInjectable),
    };

    return (cluster: Cluster) => new ContextHandler(dependencies, cluster);
  },
});

export default createContextHandlerInjectable;
