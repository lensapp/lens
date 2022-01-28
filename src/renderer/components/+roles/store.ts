/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { Role, RoleApi } from "../../../common/k8s-api/endpoints";
import { KubeObjectStore } from "../../../common/k8s-api/kube-object.store";
import { autoBind } from "../../utils";

export class RoleStore extends KubeObjectStore<Role> {
  constructor(public readonly api:RoleApi) {
    super();
    autoBind(this);
  }

  protected sortItems(items: Role[]) {
    return super.sortItems(items, [
      role => role.kind,
      role => role.getName(),
    ]);
  }

  protected createItem(params: { name: string; namespace?: string }, data?: Partial<Role>) {
    return this.api.create(params, data);
  }
}
