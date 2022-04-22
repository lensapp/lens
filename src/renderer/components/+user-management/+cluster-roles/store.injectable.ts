/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import assert from "assert";
import { createStoresAndApisInjectionToken } from "../../../../common/k8s-api/create-stores-apis.token";
import clusterRoleApiInjectable from "../../../../common/k8s-api/endpoints/cluster-role.api.injectable";
import { kubeObjectStoreInjectionToken } from "../../../../common/k8s-api/api-manager/manager.injectable";
import { ClusterRolesStore } from "./store";

const clusterRoleStoreInjectable = getInjectable({
  id: "cluster-role-store",
  instantiate: (di) => {
    assert(di.inject(createStoresAndApisInjectionToken), "clusterRoleStore is only available in certain environments");

    const api = di.inject(clusterRoleApiInjectable);

    return new ClusterRolesStore(api);
  },
  injectionToken: kubeObjectStoreInjectionToken,
});

export default clusterRoleStoreInjectable;
