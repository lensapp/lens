/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import fetchInjectable from "../fetch/fetch.injectable";
import loggerInjectable from "../logger.injectable";
import { apiKubePrefix, isDebugging } from "../vars";
import { apiBaseInjectionToken } from "./api-base";
import type { JsonApiDependencies } from "./json-api";
import { KubeJsonApi } from "./kube-json-api";

export type CreateKubeJsonApiForCluster = (clusterId: string) => KubeJsonApi;

const createKubeJsonApiForClusterInjectable = getInjectable({
  id: "create-kube-json-api-for-cluster",
  instantiate: (di): CreateKubeJsonApiForCluster => {
    const apiBase = di.inject(apiBaseInjectionToken);
    const dependencies: JsonApiDependencies = {
      fetch: di.inject(fetchInjectable),
      logger: di.inject(loggerInjectable),
    };

    return (clusterId) => {
      const url = new URL(apiBase.config.serverAddress);

      return new KubeJsonApi(dependencies, {
        serverAddress: apiBase.config.serverAddress,
        apiBase: apiKubePrefix,
        debug: isDebugging,
      }, {
        headers: {
          "Host": `${clusterId}.localhost:${url.port}`,
        },
      });
    };
  },
});

export default createKubeJsonApiForClusterInjectable;
