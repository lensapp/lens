/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import assert from "assert";
import { storesAndApisCanBeCreatedInjectionToken } from "../../../../common/k8s-api/stores-apis-can-be-created.token";
import clusterRoleApiInjectable from "../../../../common/k8s-api/endpoints/cluster-role.api.injectable";
import { getKubeStoreInjectable } from "../../../../common/k8s-api/api-manager/kube-object-store-token";
import { ClusterRoleStore } from "./store";
import clusterFrameContextForClusterScopedResourcesInjectable from "../../../cluster-frame-context/for-cluster-scoped-resources.injectable";
import { loggerInjectionToken } from "@k8slens/logger";

const clusterRoleStoreInjectable = getKubeStoreInjectable({
  id: "cluster-role-store",
  instantiate: (di) => {
    assert(di.inject(storesAndApisCanBeCreatedInjectionToken), "clusterRoleStore is only available in certain environments");

    const api = di.inject(clusterRoleApiInjectable);

    return new ClusterRoleStore({
      context: di.inject(clusterFrameContextForClusterScopedResourcesInjectable),
      logger: di.inject(loggerInjectionToken),
    }, api);
  },
});

export default clusterRoleStoreInjectable;
