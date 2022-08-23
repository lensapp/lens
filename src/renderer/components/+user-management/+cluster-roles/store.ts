/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { ClusterRole, ClusterRoleApi, ClusterRoleData } from "../../../../common/k8s-api/endpoints";
import { KubeObjectStore } from "../../../../common/k8s-api/kube-object.store";

export class ClusterRolesStore extends KubeObjectStore<ClusterRole, ClusterRoleApi, ClusterRoleData> {
  protected sortItems(items: ClusterRole[]) {
    return super.sortItems(items, [
      clusterRole => clusterRole.kind,
      clusterRole => clusterRole.getName(),
    ]);
  }
}
