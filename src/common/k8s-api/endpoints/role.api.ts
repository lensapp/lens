/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { KubeObjectMetadata, KubeObjectScope } from "../kube-object";
import { KubeObject } from "../kube-object";
import type { DerivedKubeApiOptions } from "../kube-api";
import { KubeApi } from "../kube-api";
import type { KubeJsonApiData } from "../kube-json-api";
import type { PolicyRule } from "./types/policy-rule";

export interface RoleData extends KubeJsonApiData<KubeObjectMetadata<KubeObjectScope.Namespace>, void, void> {
  rules?: PolicyRule[];
}

export class Role extends KubeObject<void, void, KubeObjectScope.Namespace> {
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

export class RoleApi extends KubeApi<Role, RoleData> {
  constructor(opts: DerivedKubeApiOptions = {}) {
    super({
      ...opts,
      objectConstructor: Role,
    });
  }
}
