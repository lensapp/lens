/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { Patch } from "rfc6902";
import apiBaseInjectable from "../../api-base.injectable";
import type { AsyncResult, Result } from "@k8slens/utilities";
import { result } from "@k8slens/utilities";
import type { KubeJsonApiData } from "@k8slens/kube-object";

export type RequestKubeObjectPatch = (name: string, kind: string, ns: string | undefined, patch: Patch) => AsyncResult<KubeJsonApiData, Error>;

const requestKubeObjectPatchInjectable = getInjectable({
  id: "request-kube-object-patch",
  instantiate: (di): RequestKubeObjectPatch => {
    const apiBase = di.inject(apiBaseInjectable);

    return async (name, kind, ns, patch) => {
      const patchResult = (await apiBase.patch("/stack", {
        data: {
          name,
          kind,
          ns,
          patch,
        },
      })) as Result<string, string>;

      if (!patchResult.isOk) {
        return result.wrapError("Failed to patch kube object", patchResult);
      }

      try {
        return result.ok(JSON.parse(patchResult.value) as KubeJsonApiData);
      } catch (error) {
        return result.error(new Error("Failed to parse response from patching kube object", { cause: error }));
      }
    };
  },
});

export default requestKubeObjectPatchInjectable;
