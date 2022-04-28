/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { Cluster } from "../../common/cluster/cluster";
import type { ContextHandlerDependencies } from "./context-handler";
import { ContextHandler } from "./context-handler";
import createKubeAuthProxyInjectable from "../kube-auth-proxy/create-kube-auth-proxy.injectable";
import getKubeAuthProxyCertificateInjectable from "../kube-auth-proxy/get-proxy-cert.injectable";

export type CreateContextHandler = (cluster: Cluster) => ContextHandler | undefined;

const createContextHandlerInjectable = getInjectable({
  id: "create-context-handler",

  instantiate: (di): CreateContextHandler => {
    const dependencies: ContextHandlerDependencies = {
      createKubeAuthProxy: di.inject(createKubeAuthProxyInjectable),
      getKubeAuthProxyCertificate: di.inject(getKubeAuthProxyCertificateInjectable),
    };

    return (cluster) => new ContextHandler(dependencies, cluster);
  },
});

export default createContextHandlerInjectable;
