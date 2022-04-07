/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { apiManager } from "../../../../common/k8s-api/api-manager";
import type { ClusterRole } from "../../../../common/k8s-api/endpoints";
import { clusterRoleApi } from "../../../../common/k8s-api/endpoints";
import { KubeObjectStore } from "../../../../common/k8s-api/kube-object.store";
import { autoBind } from "../../../utils";

export class ClusterRolesStore extends KubeObjectStore<ClusterRole> {
  api = clusterRoleApi;

  constructor() {
    super();
    autoBind(this);
  }

  protected sortItems(items: ClusterRole[]) {
    return super.sortItems(items, [
      clusterRole => clusterRole.kind,
      clusterRole => clusterRole.getName(),
    ]);
  }
}

export const clusterRolesStore = new ClusterRolesStore();

apiManager.registerStore(clusterRolesStore);
