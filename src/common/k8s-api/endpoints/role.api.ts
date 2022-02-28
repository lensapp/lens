/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { KubeObject } from "../kube-object";
import { BaseKubeApiOptions, KubeApi } from "../kube-api";
import { isClusterPageContext } from "../../utils/cluster-id-url-parsing";

export interface Role {
  rules: {
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

/**
 * The api type for {@link Role}'s
 */

export class RoleApi extends KubeApi<Role> {
  constructor(params?: BaseKubeApiOptions) {
    super({
      ...(params ?? {}),
      objectConstructor: Role,
    });
  }
}

/**
 * Only available within kubernetes cluster pages
 */
export const roleApi = isClusterPageContext()
  ? new RoleApi()
  : undefined;

