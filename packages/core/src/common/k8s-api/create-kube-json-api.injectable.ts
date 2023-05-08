/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { Agent } from "https";
import type { RequestInit } from "@k8slens/node-fetch";
import lensProxyCertificateInjectable from "../certificate/lens-proxy-certificate.injectable";
import fetchInjectable from "../fetch/fetch.injectable";
import { loggerInjectionToken } from "@k8slens/logger";
import type { JsonApiConfig, JsonApiDependencies } from "@k8slens/json-api";
import { KubeJsonApi } from "@k8slens/kube-api";

export type CreateKubeJsonApi = (config: JsonApiConfig, reqInit?: RequestInit) => KubeJsonApi;

const createKubeJsonApiInjectable = getInjectable({
  id: "create-kube-json-api",
  instantiate: (di): CreateKubeJsonApi => {
    const dependencies: JsonApiDependencies = {
      fetch: di.inject(fetchInjectable),
      logger: di.inject(loggerInjectionToken),
    };
    const lensProxyCert = di.inject(lensProxyCertificateInjectable);

    return (config, reqInit) => {
      if (!config.getRequestOptions) {
        config.getRequestOptions = async () => {
          const agent = new Agent({
            ca: lensProxyCert.get().cert,
          });
  
          return {
            agent,
          };
        };
      }
      
      return new KubeJsonApi(dependencies, config, reqInit);
    };
  },
});

export default createKubeJsonApiInjectable;
