/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { isClusterPageContext } from "../../utils/cluster-id-url-parsing";
import type { DerivedKubeApiOptions } from "../kube-api";
import { KubeApi } from "../kube-api";
import type { KubeJsonApiData } from "../kube-json-api";
import type { KubeObjectMetadata } from "../kube-object";
import { KubeObject } from "../kube-object";
import type { AggregationRule } from "./types/aggregation-rule";
import type { PolicyRule } from "./types/policy-rule";

export interface ClusterRoleData extends KubeJsonApiData<KubeObjectMetadata<"cluster-scoped">, void, void> {
  rules?: PolicyRule[];
  aggregationRule?: AggregationRule;
}

export class ClusterRole extends KubeObject<void, void, "cluster-scoped"> {
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

export class ClusterRoleApi extends KubeApi<ClusterRole, ClusterRoleData> {
  constructor(opts: DerivedKubeApiOptions = {}) {
    super({
      ...opts,
      objectConstructor: ClusterRole,
    });
  }
}

export const clusterRoleApi = isClusterPageContext()
  ? new ClusterRoleApi()
  : undefined as never;
