/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import apiBaseInjectable from "../../api-base.injectable";
import type { AsyncResult, Result } from "@k8slens/utilities";
import type { KubeJsonApiData } from "@k8slens/kube-object";

export type RequestKubeObjectCreation = (resourceDescriptor: string) => AsyncResult<KubeJsonApiData, string>;

const requestKubeObjectCreationInjectable = getInjectable({
  id: "request-kube-object-creation",
  instantiate: (di): RequestKubeObjectCreation => {
    const apiBase = di.inject(apiBaseInjectable);

    return async (data) => {
      const result = await apiBase.post("/stack", { data }) as Result<string, string>;

      if (!result.callWasSuccessful) {
        return result;
      }

      try {
        const response = JSON.parse(result.response);

        return {
          callWasSuccessful: true,
          response,
        };
      } catch (error) {
        return {
          callWasSuccessful: false,
          error: String(error),
        };
      }
    };
  },
});

export default requestKubeObjectCreationInjectable;
