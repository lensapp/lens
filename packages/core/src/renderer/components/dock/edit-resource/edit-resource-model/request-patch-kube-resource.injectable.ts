/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { AsyncResult } from "@k8slens/utilities";
import type { JsonPatch } from "../../../../../common/k8s-api/kube-object.store";
import { getErrorMessage } from "../../../../../common/utils/get-error-message";
import apiKubeInjectable from "../../../../k8s/api-kube.injectable";
import { patchTypeHeaders } from "../../../../../common/k8s-api/kube-api";

export type RequestPatchKubeResource = (selfLink: string, patch: JsonPatch) => AsyncResult<{ name: string; kind: string }>;

const requestPatchKubeResourceInjectable = getInjectable({
  id: "request-patch-kube-resource",
  instantiate: (di): RequestPatchKubeResource => {
    const apiKube = di.inject(apiKubeInjectable);

    return async (selfLink, patch) => {
      try {
        const kubeObject = await apiKube.patch(selfLink, { data: patch }, {
          headers: {
            "content-type": patchTypeHeaders.json,
          },
        });

        return {
          callWasSuccessful: true,
          response: { name: kubeObject.metadata.name, kind: kubeObject.kind },
        };
      } catch (e) {
        return {
          callWasSuccessful: false,
          error: getErrorMessage(e),
        };
      }
    };
  },

  causesSideEffects: true,
});

export default requestPatchKubeResourceInjectable;
