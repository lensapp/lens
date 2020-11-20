import { KubeObject } from "../kube-object";
import { KubeApi } from "../kube-api";
import { KubeJsonApiData } from "../kube-json-api";

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

export class ResourceQuota extends KubeObject {
  static kind = "ResourceQuota"
  static namespaced = true
  static apiBase = "/api/v1/resourcequotas"

  constructor(data: KubeJsonApiData) {
    super(data);
    this.spec = this.spec || {} as any
  }

  spec: {
    hard: IResourceQuotaValues;
    scopeSelector?: {
      matchExpressions: {
        operator: string;
        scopeName: string;
        values: string[];
      }[];
    };
  }

  status: {
    hard: IResourceQuotaValues;
    used: IResourceQuotaValues;
  }

  getScopeSelector() {
    const { matchExpressions = [] } = this.spec.scopeSelector || {};
    return matchExpressions;
  }
}

export const resourceQuotaApi = new KubeApi({
  objectConstructor: ResourceQuota,
});
