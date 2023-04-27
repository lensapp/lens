/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { ClusterRole, ClusterRoleData } from "@k8slens/kube-object";
import type { ClusterRoleApi } from "../../../../common/k8s-api/endpoints";
import { KubeObjectStore } from "../../../../common/k8s-api/kube-object.store";

export class ClusterRoleStore extends KubeObjectStore<ClusterRole, ClusterRoleApi, ClusterRoleData> {
  protected sortItems(items: ClusterRole[]) {
    return super.sortItems(items, [
      clusterRole => clusterRole.kind,
      clusterRole => clusterRole.getName(),
    ]);
  }
}
