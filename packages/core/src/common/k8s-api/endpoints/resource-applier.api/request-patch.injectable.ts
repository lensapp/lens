/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { Patch } from "rfc6902";
import apiBaseInjectable from "../../api-base.injectable";
import type { AsyncResult } from "../../../utils/async-result";
import type { KubeJsonApiData } from "../../kube-json-api";

export type RequestKubeObjectPatch = (name: string, kind: string, ns: string | undefined, patch: Patch) => Promise<AsyncResult<KubeJsonApiData, string>>;

const requestKubeObjectPatchInjectable = getInjectable({
  id: "request-kube-object-patch",
  instantiate: (di): RequestKubeObjectPatch => {
    const apiBase = di.inject(apiBaseInjectable);

    return async (name, kind, ns, patch) => {
      const result = await apiBase.patch("/stack", {
        data: {
          name,
          kind,
          ns,
          patch,
        },
      }) as AsyncResult<string, string>;

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

export default requestKubeObjectPatchInjectable;
