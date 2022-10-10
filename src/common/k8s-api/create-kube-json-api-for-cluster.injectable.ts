/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { apiKubePrefix } from "../vars";
import isDebuggingInjectable from "../vars/is-debugging.injectable";
import { apiBaseInjectionToken } from "./api-base";
import createKubeJsonApiInjectable from "./create-kube-json-api.injectable";
import type { KubeJsonApi } from "./kube-json-api";

export type CreateKubeJsonApiForCluster = (clusterId: string) => KubeJsonApi;

const createKubeJsonApiForClusterInjectable = getInjectable({
  id: "create-kube-json-api-for-cluster",
  instantiate: (di): CreateKubeJsonApiForCluster => {
    const apiBase = di.inject(apiBaseInjectionToken);
    const createKubeJsonApi = di.inject(createKubeJsonApiInjectable);
    const isDebugging = di.inject(isDebuggingInjectable);

    return (clusterId) => createKubeJsonApi(
      {
        serverAddress: apiBase.config.serverAddress,
        apiBase: apiKubePrefix,
        debug: isDebugging,
      },
      {
        headers: {
          "Host": `${clusterId}.localhost:${new URL(apiBase.config.serverAddress).port}`,
        },
      },
    );
  },
});

export default createKubeJsonApiForClusterInjectable;
