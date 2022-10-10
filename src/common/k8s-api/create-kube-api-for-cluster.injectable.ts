/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { apiKubePrefix } from "../vars";
import isDevelopmentInjectable from "../vars/is-development.injectable";
import { apiBaseInjectionToken } from "./api-base";
import createKubeJsonApiInjectable from "./create-kube-json-api.injectable";
import type { KubeApiOptions } from "./kube-api";
import { KubeApi } from "./kube-api";
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
    const createKubeJsonApi = di.inject(createKubeJsonApiInjectable);

    return (
      cluster: CreateKubeApiForLocalClusterConfig,
      kubeClass: KubeObjectConstructor<KubeObject, KubeJsonApiDataFor<KubeObject>>,
      apiClass = KubeApi,
    ) => (
      new apiClass({
        objectConstructor: kubeClass,
        request: createKubeJsonApi(
          {
            serverAddress: apiBase.config.serverAddress,
            apiBase: apiKubePrefix,
            debug: isDevelopment,
          }, {
            headers: {
              "Host": `${cluster.metadata.uid}.localhost:${new URL(apiBase.config.serverAddress).port}`,
            },
          },
        ),
      })
    );
  },
});

export default createKubeApiForClusterInjectable;
