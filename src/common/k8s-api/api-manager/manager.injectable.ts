/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { storesAndApisCanBeCreatedInjectionToken } from "../stores-apis-can-be-created.token";
import { ApiManager } from "./api-manager";
import { computedInjectManyInjectable } from "@ogre-tools/injectable-extension-for-mobx";
import { kubeObjectStoreInjectionToken } from "./kube-object-store-token";
import { kubeApiInjectionToken } from "../kube-api/kube-api-injection-token";
import { computed } from "mobx";

const apiManagerInjectable = getInjectable({
  id: "api-manager",
  instantiate: (di) => {
    const computedInjectMany = di.inject(computedInjectManyInjectable);
    const storesAndApisCanBeCreated = di.inject(storesAndApisCanBeCreatedInjectionToken);

    return new ApiManager({
      apis: storesAndApisCanBeCreated
        ? computedInjectMany(kubeApiInjectionToken)
        : computed(() => []),
      stores: storesAndApisCanBeCreated
        ? computedInjectMany(kubeObjectStoreInjectionToken)
        : computed(() => []),
    });
  },
});

export default apiManagerInjectable;
