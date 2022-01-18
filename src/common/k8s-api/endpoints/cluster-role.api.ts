/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { isClusterPageContext } from "../../utils/cluster-id-url-parsing";
import { KubeApi } from "../kube-api";
import { KubeObject } from "../kube-object";

export interface ClusterRole {
  rules: {
    verbs: string[];
    apiGroups: string[];
    resources: string[];
    resourceNames?: string[];
  }[];
}

export class ClusterRole extends KubeObject {
  static kind = "ClusterRole";
  static namespaced = false;
  static apiBase = "/apis/rbac.authorization.k8s.io/v1/clusterroles";

  getRules() {
    return this.rules || [];
  }
}

/**
 * Only available within kubernetes cluster pages
 */
let clusterRoleApi: KubeApi<ClusterRole>;

if (isClusterPageContext()) { // initialize automatically only when within a cluster iframe/context
  clusterRoleApi = new KubeApi({
    objectConstructor: ClusterRole,
  });
}

export {
  clusterRoleApi,
};
