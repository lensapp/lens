/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { KubeObject } from "../kube-object";
import { KubeApi, SpecificApiOptions } from "../kube-api";

export const resourceQuotaKinds = [
  "limits.cpu",
  "limits.memory",
  "requests.cpu",
  "requests.memory",
  "requests.storage",
  "persistentvolumeclaims",
  "count/pods",
  "count/persistentvolumeclaims",
  "count/services",
  "count/secrets",
  "count/configmaps",
  "count/replicationcontrollers",
  "count/deployments.apps",
  "count/replicasets.apps",
  "count/statefulsets.apps",
  "count/jobs.batch",
  "count/cronjobs.batch",
  "count/deployments.extensions",
] as const;

export type ResourceQuotaKinds = typeof resourceQuotaKinds[number];

export type IResourceQuotaValues = Partial<Record<ResourceQuotaKinds | string, string>>;

export interface ResourceQuota {
  spec: {
    hard: IResourceQuotaValues;
    scopeSelector?: {
      matchExpressions: {
        operator: string;
        scopeName: string;
        values: string[];
      }[];
    };
  };

  status: {
    hard: IResourceQuotaValues;
    used: IResourceQuotaValues;
  };
}

export class ResourceQuota extends KubeObject {
  static kind = "ResourceQuota";
  static namespaced = true;
  static apiBase = "/api/v1/resourcequotas";

  getScopeSelector() {
    const { matchExpressions = [] } = this.spec.scopeSelector || {};

    return matchExpressions;
  }
}

export class ResourceQuotaApi extends KubeApi<ResourceQuota> {
  constructor(args: SpecificApiOptions<ResourceQuota> = {}) {
    super({
      ...args,
      objectConstructor: ResourceQuota,
    });
  }
}
