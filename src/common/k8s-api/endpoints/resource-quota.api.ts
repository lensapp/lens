/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { KubeObjectScope } from "../kube-object";
import { KubeObject } from "../kube-object";
import type { DerivedKubeApiOptions } from "../kube-api";
import { KubeApi } from "../kube-api";
import { isClusterPageContext } from "../../utils/cluster-id-url-parsing";

export type IResourceQuotaValues = Partial<Record<string, string>> & {
  // Compute Resource Quota
  "limits.cpu"?: string;
  "limits.memory"?: string;
  "requests.cpu"?: string;
  "requests.memory"?: string;

  // Storage Resource Quota
  "requests.storage"?: string;
  "persistentvolumeclaims"?: string;

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
  hard: IResourceQuotaValues;
  scopeSelector?: {
    matchExpressions: {
      operator: string;
      scopeName: string;
      values: string[];
    }[];
  };
}

export interface ResourceQuotaStatus {
  hard: IResourceQuotaValues;
  used: IResourceQuotaValues;
}

export class ResourceQuota extends KubeObject<ResourceQuotaStatus, ResourceQuotaSpec, KubeObjectScope.Namespace> {
  static readonly kind = "ResourceQuota";
  static readonly namespaced = true;
  static readonly apiBase = "/api/v1/resourcequotas";

  getScopeSelector() {
    return this.spec.scopeSelector?.matchExpressions ?? [];
  }
}

export class ResourceQuotaApi extends KubeApi<ResourceQuota> {
  constructor(opts: DerivedKubeApiOptions = {}) {
    super({
      objectConstructor: ResourceQuota,
      ...opts,
    });
  }
}

export const resourceQuotaApi = isClusterPageContext()
  ? new ResourceQuotaApi()
  : undefined as never;
