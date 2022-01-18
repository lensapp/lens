/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { KubeObject } from "../kube-object";
import { KubeApi } from "../kube-api";
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

let roleApi: KubeApi<Role>;

if (isClusterPageContext()) {
  roleApi = new KubeApi<Role>({
    objectConstructor: Role,
  });
}

export{
  roleApi,
};
