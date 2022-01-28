/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { KubeObject } from "../kube-object";
import { KubeApi, SpecificApiOptions } from "../kube-api";

export interface Role {
  rules?: {
    verbs: string[];
    apiGroups: string[];
    resources: string[];
    resourceNames?: string[];
  }[];
}

export class Role extends KubeObject {
  static kind = "Role";
  static namespaced = true;
  static apiBase = "/apis/rbac.authorization.k8s.io/v1/roles";

  getRules() {
    return this.rules || [];
  }
}

export class RoleApi extends KubeApi<Role> {
  constructor(args: SpecificApiOptions<Role> = {}) {
    super({
      ...args,
      objectConstructor: Role,
    });
  }
}
