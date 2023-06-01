/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { ApiManager } from "./api-manager";
import { computedInjectManyInjectable } from "@ogre-tools/injectable-extension-for-mobx";
import { kubeObjectStoreInjectionToken } from "./kube-object-store-token";
import { kubeApiInjectionToken, storesAndApisCanBeCreatedInjectionToken } from "@k8slens/kube-api-specifics";
import { computed } from "mobx";
import { customResourceDefinitionApiInjectionToken } from "./crd-api-token";
import createCustomResourceStoreInjectable from "./create-custom-resource-store.injectable";

const apiManagerInjectable = getInjectable({
  id: "api-manager",
  instantiate: (di) => {
    const computedInjectMany = di.inject(computedInjectManyInjectable);
    const storesAndApisCanBeCreated = di.inject(storesAndApisCanBeCreatedInjectionToken);

    return new ApiManager((
      storesAndApisCanBeCreated
        ? {
          apis: computedInjectMany(kubeApiInjectionToken),
          stores: computedInjectMany(kubeObjectStoreInjectionToken),
          crdApis: computedInjectMany(customResourceDefinitionApiInjectionToken),
          createCustomResourceStore: di.inject(createCustomResourceStoreInjectable),
        }
        : {
          apis: computed(() => []),
          stores: computed(() => []),
          crdApis: computed(() => []),
          createCustomResourceStore: () => {
            throw new Error("Tried to create a KubeObjectStore for a CustomResource in a disallowed environment");
          },
        }
    ));
  },
});

export default apiManagerInjectable;
