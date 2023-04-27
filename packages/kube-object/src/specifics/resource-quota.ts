/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { NamespaceScopedMetadata } from "../api-types";
import { KubeObject } from "../kube-object";

export type ResourceQuotaValues = Partial<Record<string, string>> & {
  // Compute Resource Quota
  "limits.cpu"?: string;
  "limits.memory"?: string;
  "requests.cpu"?: string;
  "requests.memory"?: string;

  // Storage Resource Quota
  "requests.storage"?: string;
  persistentvolumeclaims?: string;

  // Object Count Quota
  "count/pods"?: string;
  "count/persistentvolumeclaims"?: string;
  "count/services"?: string;
  "count/secrets"?: string;
  "count/configmaps"?: string;
  "count/replicationcontrollers"?: string;
  "count/deployments.apps"?: string;
  "count/replicasets.apps"?: string;
  "count/statefulsets.apps"?: string;
  "count/jobs.batch"?: string;
  "count/cronjobs.batch"?: string;
  "count/deployments.extensions"?: string;
};

export interface ResourceQuotaSpec {
  hard: ResourceQuotaValues;
  scopeSelector?: {
    matchExpressions: {
      operator: string;
      scopeName: string;
      values: string[];
    }[];
  };
}

export interface ResourceQuotaStatus {
  hard: ResourceQuotaValues;
  used: ResourceQuotaValues;
}

export class ResourceQuota extends KubeObject<NamespaceScopedMetadata, ResourceQuotaStatus, ResourceQuotaSpec> {
  static readonly kind = "ResourceQuota";

  static readonly namespaced = true;

  static readonly apiBase = "/api/v1/resourcequotas";

  getScopeSelector() {
    return this.spec.scopeSelector?.matchExpressions ?? [];
  }
}
