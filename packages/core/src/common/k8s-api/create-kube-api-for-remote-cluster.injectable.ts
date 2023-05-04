/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { AgentOptions } from "https";
import { Agent } from "https";
import type { RequestInit } from "@k8slens/node-fetch";
import { loggerInjectionToken } from "@k8slens/logger";
import isDevelopmentInjectable from "../vars/is-development.injectable";
import createKubeJsonApiInjectable from "./create-kube-json-api.injectable";
import type { KubeApiOptions } from "@k8slens/kube-api";
import { KubeApi } from "@k8slens/kube-api";
import type { KubeJsonApiDataFor, KubeObject, KubeObjectConstructor } from "@k8slens/kube-object";
import { isDefined } from "@k8slens/utilities";

export interface CreateKubeApiForRemoteClusterConfig {
  cluster: {
    server: string;
    caData?: string;
    skipTLSVerify?: boolean;
  };
  user: {
    token?: string | (() => Promise<string>);
    clientCertificateData?: string;
    clientKeyData?: string;
  };
  /**
   * Custom instance of https.agent to use for the requests
   *
   * @remarks the custom agent replaced default agent, options skipTLSVerify,
   * clientCertificateData, clientKeyData and caData are ignored.
   */
   agent?: Agent;
}

export type KubeApiConstructor<Kube extends KubeObject, Api extends KubeApi<Kube>> = new (apiOpts: KubeApiOptions<Kube>) => Api;

export interface CreateKubeApiForRemoteCluster {
  <Kube extends KubeObject, Api extends KubeApi<Kube>, Data extends KubeJsonApiDataFor<Kube>>(
    config: CreateKubeApiForRemoteClusterConfig,
    kubeClass: KubeObjectConstructor<Kube, Data>,
    apiClass: KubeApiConstructor<Kube, Api>,
  ): Api;
  <Kube extends KubeObject, Data extends KubeJsonApiDataFor<Kube>>(
    config: CreateKubeApiForRemoteClusterConfig,
    kubeClass: KubeObjectConstructor<Kube, Data>,
    apiClass?: KubeApiConstructor<Kube, KubeApi<Kube>>,
  ): KubeApi<Kube>;
}

const createKubeApiForRemoteClusterInjectable = getInjectable({
  id: "create-kube-api-for-remote-cluster",
  instantiate: (di): CreateKubeApiForRemoteCluster => {
    const isDevelopment = di.inject(isDevelopmentInjectable);
    const createKubeJsonApi = di.inject(createKubeJsonApiInjectable);
    const logger = di.inject(loggerInjectionToken);

    return (
      config: CreateKubeApiForRemoteClusterConfig,
      kubeClass: KubeObjectConstructor<KubeObject, KubeJsonApiDataFor<KubeObject>>,
      apiClass?: KubeApiConstructor<KubeObject, KubeApi<KubeObject>>,
    ) => {
      const reqInit: RequestInit = {};
      const agentOptions: AgentOptions = {};

      if (config.cluster.skipTLSVerify === true) {
        agentOptions.rejectUnauthorized = false;
      }

      if (config.user.clientCertificateData) {
        agentOptions.cert = config.user.clientCertificateData;
      }

      if (config.user.clientKeyData) {
        agentOptions.key = config.user.clientKeyData;
      }

      if (config.cluster.caData) {
        agentOptions.ca = config.cluster.caData;
      }

      if (Object.keys(agentOptions).length > 0) {
        reqInit.agent = new Agent(agentOptions);
      }

      if (config.agent) {
        reqInit.agent = config.agent;
      }

      const token = config.user.token;
      const request = createKubeJsonApi({
        serverAddress: config.cluster.server,
        apiBase: "",
        debug: isDevelopment,
        ...(isDefined(token) ? {
          getRequestOptions: async () => ({
            headers: {
              "Authorization": `Bearer ${typeof token === "function" ? await token() : token}`,
            },
          }),
        } : {}),
      }, reqInit);

      if (apiClass) {
        return new apiClass({
          objectConstructor: kubeClass,
          request,
        });
      }

      return new KubeApi(
        {
          logger,
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

export default createKubeApiForRemoteClusterInjectable;
