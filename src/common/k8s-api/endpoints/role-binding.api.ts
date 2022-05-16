/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { KubeObjectMetadata, KubeObjectScope } from "../kube-object";
import { KubeObject } from "../kube-object";
import type { DerivedKubeApiOptions } from "../kube-api";
import { KubeApi } from "../kube-api";
import type { KubeJsonApiData } from "../kube-json-api";
import type { RoleRef } from "./types/role-ref";
import type { Subject } from "./types/subject";

export interface RoleBindingData extends KubeJsonApiData<KubeObjectMetadata<KubeObjectScope.Namespace>, void, void> {
  subjects?: Subject[];
  roleRef: RoleRef;
}

export class RoleBinding extends KubeObject<void, void, KubeObjectScope.Namespace> {
  static readonly kind = "RoleBinding";
  static readonly namespaced = true;
  static readonly apiBase = "/apis/rbac.authorization.k8s.io/v1/rolebindings";

  subjects?: Subject[];
  roleRef: RoleRef;

  constructor({ subjects, roleRef, ...rest }: RoleBindingData) {
    super(rest);
    this.subjects = subjects;
    this.roleRef = roleRef;
  }

  getSubjects() {
    return this.subjects || [];
  }

  getSubjectNames(): string {
    return this.getSubjects().map(subject => subject.name).join(", ");
  }
}

export class RoleBindingApi extends KubeApi<RoleBinding, RoleBindingData> {
  constructor(opts: DerivedKubeApiOptions = {}) {
    super({
      ...opts,
      objectConstructor: RoleBinding,
    });
  }
}
