import { KubeObject } from "../kube-object";
import { KubeApi } from "../kube-api";

export interface IResourceQuotaValues {
  [quota: string]: string | undefined;

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

interface ResourceQuotaSpec {
  hard: IResourceQuotaValues;
  scopeSelector?: {
    matchExpressions: {
      operator: string;
      scopeName: string;
      values: string[];
    }[];
  };
}

interface ResourceQuotaStatus {
  hard: IResourceQuotaValues;
  used: IResourceQuotaValues;
}

export class ResourceQuota extends KubeObject<ResourceQuotaSpec, ResourceQuotaStatus> {
  static kind = "ResourceQuota";
  static namespaced = true;
  static apiBase = "/api/v1/resourcequotas";

  getScopeSelector() {
    return this.spec?.scopeSelector?.matchExpressions ?? [];
  }
}

export const resourceQuotaApi = new KubeApi({
  objectConstructor: ResourceQuota,
});
