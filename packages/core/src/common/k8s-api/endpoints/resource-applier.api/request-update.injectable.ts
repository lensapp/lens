/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import apiBaseInjectable from "../../api-base.injectable";
import type { AsyncResult, Result } from "@k8slens/utilities";
import { result } from "@k8slens/utilities";
import type { KubeJsonApiData } from "@k8slens/kube-object";

export type RequestKubeObjectCreation = (resourceDescriptor: string) => AsyncResult<KubeJsonApiData, Error>;

const requestKubeObjectCreationInjectable = getInjectable({
  id: "request-kube-object-creation",
  instantiate: (di): RequestKubeObjectCreation => {
    const apiBase = di.inject(apiBaseInjectable);

    return async (data) => {
      const postResult = await apiBase.post("/stack", { data }) as Result<string, string>;

      if (!postResult.isOk) {
        return result.wrapError("Failed to create kube object", postResult);
      }

      try {
        return result.ok(JSON.parse(postResult.value) as KubeJsonApiData);
      } catch (error) {
        return result.error(new Error("Failed to parse result from kube object creation", { cause: error }));
      }
    };
  },
});

export default requestKubeObjectCreationInjectable;
