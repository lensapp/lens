/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { apiManager } from "../../../../common/k8s-api/api-manager";
import type { Role, RoleApi, RoleData } from "../../../../common/k8s-api/endpoints";
import { roleApi } from "../../../../common/k8s-api/endpoints";
import { KubeObjectStore } from "../../../../common/k8s-api/kube-object.store";
import { isClusterPageContext } from "../../../utils";

export class RolesStore extends KubeObjectStore<Role, RoleApi, RoleData> {
  protected sortItems(items: Role[]) {
    return super.sortItems(items, [
      role => role.kind,
      role => role.getName(),
    ]);
  }
}

export const rolesStore = isClusterPageContext()
  ? new RolesStore(roleApi)
  : undefined as never;

if (isClusterPageContext()) {
  apiManager.registerStore(rolesStore);
}
