/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { Patch } from "rfc6902";
import apiBaseInjectable from "../../api-base.injectable";
import type { AsyncResult, Result } from "@k8slens/utilities";
import type { KubeJsonApiData } from "@k8slens/kube-object";

export type RequestKubeObjectPatch = (name: string, kind: string, ns: string | undefined, patch: Patch) => AsyncResult<KubeJsonApiData, string>;

const requestKubeObjectPatchInjectable = getInjectable({
  id: "request-kube-object-patch",
  instantiate: (di): RequestKubeObjectPatch => {
    const apiBase = di.inject(apiBaseInjectable);

    return async (name, kind, ns, patch) => {
      const result = (await apiBase.patch("/stack", {
        data: {
          name,
          kind,
          ns,
          patch,
        },
      })) as Result<string, string>;

      if (!result.callWasSuccessful) {
        return result;
      }

      try {
        const response = JSON.parse(result.response) as KubeJsonApiData;

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

export default requestKubeObjectPatchInjectable;
