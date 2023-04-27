/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { KubeJsonApiData, KubeObjectMetadata, KubeObjectScope, ClusterScopedMetadata } from "../api-types";
import { KubeObject } from "../kube-object";
import type { AggregationRule } from "../types/aggregation-rule";
import type { PolicyRule } from "../types/policy-rule";

export interface ClusterRoleData extends KubeJsonApiData<KubeObjectMetadata<KubeObjectScope.Cluster>, void, void> {
  rules?: PolicyRule[];
  aggregationRule?: AggregationRule;
}

export class ClusterRole extends KubeObject<ClusterScopedMetadata, void, void> {
  static kind = "ClusterRole";

  static namespaced = false;

  static apiBase = "/apis/rbac.authorization.k8s.io/v1/clusterroles";

  rules?: PolicyRule[];

  aggregationRule?: AggregationRule;

  constructor({ rules, aggregationRule, ...rest }: ClusterRoleData) {
    super(rest);
    this.rules = rules;
    this.aggregationRule = aggregationRule;
  }

  getRules() {
    return this.rules || [];
  }
}
