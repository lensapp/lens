/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import fetchInjectable from "../fetch/fetch.injectable";
import loggerInjectable from "../logger.injectable";
import { apiKubePrefix } from "../vars";
import isDevelopmentInjectable from "../vars/is-development.injectable";
import { apiBaseInjectionToken } from "./api-base";
import type { JsonApiDependencies } from "./json-api";
import type { KubeApiOptions } from "./kube-api";
import { KubeApi } from "./kube-api";
import { KubeJsonApi } from "./kube-json-api";
import type { KubeJsonApiDataFor, KubeObject, KubeObjectConstructor } from "./kube-object";

export interface CreateKubeApiForLocalClusterConfig {
  metadata: {
    uid: string;
  };
}

export interface CreateKubeApiForCluster {
  <Object extends KubeObject, Api extends KubeApi<Object>, Data extends KubeJsonApiDataFor<Object>>(
    cluster: CreateKubeApiForLocalClusterConfig,
    kubeClass: KubeObjectConstructor<Object, Data>,
    apiClass: new (apiOpts: KubeApiOptions<Object>) => Api
  ): Api;
  <Object extends KubeObject, Data extends KubeJsonApiDataFor<Object>>(
    cluster: CreateKubeApiForLocalClusterConfig,
    kubeClass: KubeObjectConstructor<Object, Data>,
    apiClass?: new (apiOpts: KubeApiOptions<Object>) => KubeApi<Object>
  ): KubeApi<Object>;
}

const createKubeApiForClusterInjectable = getInjectable({
  id: "create-kube-api-for-cluster",
  instantiate: (di): CreateKubeApiForCluster => {
    const apiBase = di.inject(apiBaseInjectionToken);
    const isDevelopment = di.inject(isDevelopmentInjectable);
    const dependencies: JsonApiDependencies = {
      fetch: di.inject(fetchInjectable),
      logger: di.inject(loggerInjectable),
    };

    return (cluster: CreateKubeApiForLocalClusterConfig, kubeClass: KubeObjectConstructor<KubeObject, KubeJsonApiDataFor<KubeObject>>, apiClass = KubeApi) => {
      const url = new URL(apiBase.config.serverAddress);
      const request = new KubeJsonApi(dependencies, {
        serverAddress: apiBase.config.serverAddress,
        apiBase: apiKubePrefix,
        debug: isDevelopment,
      }, {
        headers: {
          "Host": `${cluster.metadata.uid}.localhost:${url.port}`,
        },
      });

      return new apiClass({
        objectConstructor: kubeClass,
        request,
      });
    };
  },
});

export default createKubeApiForClusterInjectable;
