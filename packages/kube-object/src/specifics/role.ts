/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { KubeJsonApiData, KubeObjectMetadata, KubeObjectScope, NamespaceScopedMetadata } from "../api-types";
import { KubeObject } from "../kube-object";
import type { PolicyRule } from "../types/policy-rule";

export interface RoleData extends KubeJsonApiData<KubeObjectMetadata<KubeObjectScope.Namespace>, void, void> {
  rules?: PolicyRule[];
}

export class Role extends KubeObject<NamespaceScopedMetadata, void, void> {
  static readonly kind = "Role";

  static readonly namespaced = true;

  static readonly apiBase = "/apis/rbac.authorization.k8s.io/v1/roles";

  rules?: PolicyRule[];

  constructor({ rules, ...rest }: RoleData) {
    super(rest);
    this.rules = rules;
  }

  getRules() {
    return this.rules || [];
  }
}
