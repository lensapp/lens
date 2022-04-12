/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import assert from "assert";
import { createStoresAndApisInjectionToken } from "../../../../common/k8s-api/create-stores-apis.token";
import clusterRoleBindingApiInjectable from "../../../../common/k8s-api/endpoints/cluster-role-binding.api.injectable";
import apiManagerInjectable from "../../../../common/k8s-api/api-manager/manager.injectable";
import { ClusterRoleBindingStore } from "./store";

const clusterRoleBindingStoreInjectable = getInjectable({
  id: "cluster-role-binding-store",
  instantiate: (di) => {
    assert(di.inject(createStoresAndApisInjectionToken), "clusterRoleBindingStore is only accessible in certain environments");

    const api = di.inject(clusterRoleBindingApiInjectable);
    const apiManager = di.inject(apiManagerInjectable);
    const store = new ClusterRoleBindingStore(api);

    apiManager.registerStore(store);

    return store;
  },
});

export default clusterRoleBindingStoreInjectable;
