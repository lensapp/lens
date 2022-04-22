/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { NamespaceStore } from "./store";
import { kubeObjectStoreInjectionToken } from "../../../common/k8s-api/api-manager/manager.injectable";
import createStorageInjectable from "../../utils/create-storage/create-storage.injectable";
import namespaceApiInjectable from "../../../common/k8s-api/endpoints/namespace.api.injectable";
import assert from "assert";
import createStoresAndApisInjectable from "../../create-stores-apis.injectable";

const namespaceStoreInjectable = getInjectable({
  id: "namespace-store",

  instantiate: (di) => {
    assert(di.inject(createStoresAndApisInjectable), "namespaceStore is only available in certain environments");

    const createStorage = di.inject(createStorageInjectable);
    const api = di.inject(namespaceApiInjectable);

    return new NamespaceStore({
      storage: createStorage<string[] | undefined>("selected_namespaces", undefined),
    }, api);
  },
  injectionToken: kubeObjectStoreInjectionToken,
});

export default namespaceStoreInjectable;
