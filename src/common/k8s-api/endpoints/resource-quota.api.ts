/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { KubeObject } from "../kube-object";
import { KubeApi } from "../kube-api";
import { isClusterPageContext } from "../../utils/cluster-id-url-parsing";

export interface IResourceQuotaValues {
  [quota: string]: string;

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
}

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

let resourceQuotaApi: KubeApi<ResourceQuota>;

if (isClusterPageContext()) {
  resourceQuotaApi = new KubeApi<ResourceQuota>({
    objectConstructor: ResourceQuota,
  });
}

export {
  resourceQuotaApi,
};
