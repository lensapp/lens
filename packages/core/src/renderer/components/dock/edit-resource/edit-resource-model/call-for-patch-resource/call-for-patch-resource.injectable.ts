/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { AsyncResult } from "../../../../../../common/utils/async-result";
import apiManagerInjectable from "../../../../../../common/k8s-api/api-manager/manager.injectable";
import type { JsonPatch } from "../../../../../../common/k8s-api/kube-object.store";
import type { KubeObject } from "../../../../../../common/k8s-api/kube-object";
import assert from "assert";
import { getErrorMessage } from "../../../../../../common/utils/get-error-message";

export type CallForPatchResource = (
  item: KubeObject,
  patch: JsonPatch
) => Promise<AsyncResult<{ name: string; kind: string }>>;

const callForPatchResourceInjectable = getInjectable({
  id: "call-for-patch-resource",
  instantiate: (di): CallForPatchResource => {
    const apiManager = di.inject(apiManagerInjectable);

    return async (item, patch) => {
      const store = apiManager.getStore(item.selfLink);

      assert(store);

      let kubeObject: KubeObject;

      try {
        kubeObject = await store.patch(item, patch);
      } catch (e: any) {
        return {
          callWasSuccessful: false,
          error: getErrorMessage(e),
        };
      }

      return {
        callWasSuccessful: true,
        response: { name: kubeObject.getName(), kind: kubeObject.kind },
      };
    };
  },

  causesSideEffects: true,
});

export default callForPatchResourceInjectable;
