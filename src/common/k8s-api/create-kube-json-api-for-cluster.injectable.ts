/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import lensProxyPortInjectable from "../../features/lens-proxy/common/port.injectable";
import { lensAuthenticationHeaderValueInjectionToken } from "../auth/header-value";
import { apiKubePrefix } from "../vars";
import { lensAuthenticationHeader, lensClusterIdHeader } from "../vars/auth-header";
import isDebuggingInjectable from "../vars/is-debugging.injectable";
import createKubeJsonApiInjectable from "./create-kube-json-api.injectable";
import type { KubeJsonApi } from "./kube-json-api";

export type CreateKubeJsonApiForCluster = (clusterId: string) => KubeJsonApi;

const createKubeJsonApiForClusterInjectable = getInjectable({
  id: "create-kube-json-api-for-cluster",
  instantiate: (di): CreateKubeJsonApiForCluster => {
    const createKubeJsonApi = di.inject(createKubeJsonApiInjectable);
    const isDebugging = di.inject(isDebuggingInjectable);
    const lensProxyPort = di.inject(lensProxyPortInjectable);
    const lensAuthenticationHeaderValue = di.inject(lensAuthenticationHeaderValueInjectionToken);

    return (clusterId) => createKubeJsonApi(
      {
        serverAddress: `https://127.0.0.1:${lensProxyPort.get()}`,
        apiBase: apiKubePrefix,
        debug: isDebugging,
      },
      {
        headers: {
          [lensAuthenticationHeader]: `Bearer ${lensAuthenticationHeaderValue}`,
          [lensClusterIdHeader]: clusterId,
        },
      },
    );
  },
});

export default createKubeJsonApiForClusterInjectable;
