/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import assert from "assert";
import { storesAndApisCanBeCreatedInjectionToken, clusterRoleApiInjectable } from "@k8slens/kube-api-specifics";
import { kubeObjectStoreInjectionToken } from "../../../../common/k8s-api/api-manager/kube-object-store-token";
import { ClusterRoleStore } from "./store";
import clusterFrameContextForClusterScopedResourcesInjectable from "../../../cluster-frame-context/for-cluster-scoped-resources.injectable";
import { loggerInjectionToken } from "@k8slens/logger";

const clusterRoleStoreInjectable = getInjectable({
  id: "cluster-role-store",
  instantiate: (di) => {
    assert(di.inject(storesAndApisCanBeCreatedInjectionToken), "clusterRoleStore is only available in certain environments");

    const api = di.inject(clusterRoleApiInjectable);

    return new ClusterRoleStore({
      context: di.inject(clusterFrameContextForClusterScopedResourcesInjectable),
      logger: di.inject(loggerInjectionToken),
    }, api);
  },
  injectionToken: kubeObjectStoreInjectionToken,
});

export default clusterRoleStoreInjectable;
