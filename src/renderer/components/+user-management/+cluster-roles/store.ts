/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { apiManager } from "../../../../common/k8s-api/api-manager";
import type { ClusterRole, ClusterRoleApi, ClusterRoleData } from "../../../../common/k8s-api/endpoints";
import { clusterRoleApi } from "../../../../common/k8s-api/endpoints";
import { KubeObjectStore } from "../../../../common/k8s-api/kube-object.store";
import { isClusterPageContext } from "../../../utils";

export class ClusterRolesStore extends KubeObjectStore<ClusterRole, ClusterRoleApi, ClusterRoleData> {
  protected sortItems(items: ClusterRole[]) {
    return super.sortItems(items, [
      clusterRole => clusterRole.kind,
      clusterRole => clusterRole.getName(),
    ]);
  }
}

export const clusterRolesStore = isClusterPageContext()
  ? new ClusterRolesStore(clusterRoleApi)
  : undefined as never;

if (isClusterPageContext()) {
  apiManager.registerStore(clusterRolesStore);
}
