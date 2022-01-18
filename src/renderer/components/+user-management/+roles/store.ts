/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { apiManager } from "../../../../common/k8s-api/api-manager";
import { Role, roleApi } from "../../../../common/k8s-api/endpoints";
import { KubeObjectStore } from "../../../../common/k8s-api/kube-object.store";
import { autoBind } from "../../../utils";

export class RolesStore extends KubeObjectStore<Role> {
  api = roleApi;

  constructor() {
    super();
    autoBind(this);
  }

  protected sortItems(items: Role[]) {
    return super.sortItems(items, [
      role => role.kind,
      role => role.getName(),
    ]);
  }

  protected async createItem(params: { name: string; namespace?: string }, data?: Partial<Role>) {
    return roleApi.create(params, data);
  }
}

export const rolesStore = new RolesStore();

apiManager.registerStore(rolesStore);
