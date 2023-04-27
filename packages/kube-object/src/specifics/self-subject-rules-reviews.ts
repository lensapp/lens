/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { ClusterScopedMetadata } from "../api-types";
import { KubeObject } from "../kube-object";

export interface SelfSubjectReviewRule {
  verbs: string[];
  apiGroups?: string[];
  resources?: string[];
  resourceNames?: string[];
  nonResourceURLs?: string[];
}

export interface SelfSubjectRulesReviewSpec {
  namespace?: string;
}

export interface SelfSubjectRulesReviewStatus {
  resourceRules: SelfSubjectReviewRule[];
  nonResourceRules: SelfSubjectReviewRule[];
  incomplete: boolean;
}

export class SelfSubjectRulesReview extends KubeObject<
  ClusterScopedMetadata,
  SelfSubjectRulesReviewStatus,
  SelfSubjectRulesReviewSpec
> {
  static kind = "SelfSubjectRulesReview";

  static namespaced = false;

  static apiBase = "/apis/authorization.k8s.io/v1/selfsubjectrulesreviews";

  getResourceRules() {
    const rules = (this.status && this.status.resourceRules) || [];

    return rules.map((rule) => this.normalize(rule));
  }

  getNonResourceRules() {
    const rules = (this.status && this.status.nonResourceRules) || [];

    return rules.map((rule) => this.normalize(rule));
  }

  protected normalize(rule: SelfSubjectReviewRule): SelfSubjectReviewRule {
    const { apiGroups = [], resourceNames = [], verbs = [], nonResourceURLs = [], resources = [] } = rule;

    return {
      apiGroups,
      nonResourceURLs,
      resourceNames,
      verbs,
      resources: resources.map((resource, index) => {
        const apiGroup = apiGroups.length >= index + 1 ? apiGroups[index] : apiGroups.slice(-1)[0];
        const separator = apiGroup === "" ? "" : ".";

        return resource + separator + apiGroup;
      }),
    };
  }
}
