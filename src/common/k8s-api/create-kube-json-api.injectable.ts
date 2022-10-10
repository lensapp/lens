/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { RequestInit } from "node-fetch";
import fetchInjectable from "../fetch/fetch.injectable";
import loggerInjectable from "../logger.injectable";
import type { JsonApiConfig, JsonApiDependencies } from "./json-api";
import { KubeJsonApi } from "./kube-json-api";

export type CreateKubeJsonApi = (config: JsonApiConfig, reqInit?: RequestInit) => KubeJsonApi;

const createKubeJsonApiInjectable = getInjectable({
  id: "create-kube-json-api",
  instantiate: (di): CreateKubeJsonApi => {
    const dependencies: JsonApiDependencies = {
      fetch: di.inject(fetchInjectable),
      logger: di.inject(loggerInjectable),
    };

    return (config, reqInit) => new KubeJsonApi(dependencies, config, reqInit);
  },
});

export default createKubeJsonApiInjectable;
