/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { logErrorInjectionToken, logInfoInjectionToken, logWarningInjectionToken } from "@k8slens/logger";
import { apiKubePrefix } from "../vars";
import isDevelopmentInjectable from "../vars/is-development.injectable";
import apiBaseInjectable from "./api-base.injectable";
import type { KubeApiConstructor } from "./create-kube-api-for-remote-cluster.injectable";
import createKubeJsonApiInjectable from "./create-kube-json-api.injectable";
import { KubeApi } from "@k8slens/kube-api";
import type { KubeJsonApiDataFor, KubeObject, KubeObjectConstructor } from "@k8slens/kube-object";

export interface CreateKubeApiForLocalClusterConfig {
  metadata: {
    uid: string;
  };
}

export interface CreateKubeApiForCluster {
  <Object extends KubeObject, Api extends KubeApi<Object>, Data extends KubeJsonApiDataFor<Object>>(
    cluster: CreateKubeApiForLocalClusterConfig,
    kubeClass: KubeObjectConstructor<Object, Data>,
    apiClass: KubeApiConstructor<Object, Api>,
  ): Api;
  <Object extends KubeObject, Data extends KubeJsonApiDataFor<Object>>(
    cluster: CreateKubeApiForLocalClusterConfig,
    kubeClass: KubeObjectConstructor<Object, Data>,
    apiClass?: KubeApiConstructor<Object, KubeApi<Object>>,
  ): KubeApi<Object>;
}

const createKubeApiForClusterInjectable = getInjectable({
  id: "create-kube-api-for-cluster",
  instantiate: (di): CreateKubeApiForCluster => {
    const apiBase = di.inject(apiBaseInjectable);
    const isDevelopment = di.inject(isDevelopmentInjectable);
    const createKubeJsonApi = di.inject(createKubeJsonApiInjectable);
    const logError = di.inject(logErrorInjectionToken);
    const logInfo = di.inject(logInfoInjectionToken);
    const logWarn = di.inject(logWarningInjectionToken);

    return (
      cluster: CreateKubeApiForLocalClusterConfig,
      kubeClass: KubeObjectConstructor<KubeObject, KubeJsonApiDataFor<KubeObject>>,
      apiClass?: KubeApiConstructor<KubeObject, KubeApi<KubeObject>>,
    ) => {
      const request = createKubeJsonApi(
        {
          serverAddress: apiBase.config.serverAddress,
          apiBase: apiKubePrefix,
          debug: isDevelopment,
        }, {
          headers: {
            "Host": `${cluster.metadata.uid}.lens.app:${new URL(apiBase.config.serverAddress).port}`,
          },
        });

      if (apiClass) {
        return new apiClass({
          objectConstructor: kubeClass,
          request,
        });
      }

      return new KubeApi(
        {
          logError,
          logInfo,
          logWarn,
          maybeKubeApi: undefined,
        },
        {
          objectConstructor: kubeClass,
          request,
        },
      );
    };
  },
});

export default createKubeApiForClusterInjectable;
