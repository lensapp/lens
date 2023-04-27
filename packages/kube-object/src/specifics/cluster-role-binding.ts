/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { KubeJsonApiData, KubeObjectMetadata, KubeObjectScope, ClusterScopedMetadata } from "../api-types";
import { KubeObject } from "../kube-object";
import type { RoleRef } from "../types/role-ref";
import type { Subject } from "../types/subject";

export interface ClusterRoleBindingData
  extends KubeJsonApiData<KubeObjectMetadata<KubeObjectScope.Cluster>, void, void> {
  subjects?: Subject[];
  roleRef: RoleRef;
}

export class ClusterRoleBinding extends KubeObject<ClusterScopedMetadata, void, void> {
  static kind = "ClusterRoleBinding";

  static namespaced = false;

  static apiBase = "/apis/rbac.authorization.k8s.io/v1/clusterrolebindings";

  subjects?: Subject[];

  roleRef: RoleRef;

  constructor({ subjects, roleRef, ...rest }: ClusterRoleBindingData) {
    super(rest);
    this.subjects = subjects;
    this.roleRef = roleRef;
  }

  getSubjects() {
    return this.subjects ?? [];
  }

  getSubjectNames(): string {
    return this.getSubjects()
      .map((subject) => subject.name)
      .join(", ");
  }
}
