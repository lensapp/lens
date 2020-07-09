import { KubeObject } from "../kube-object";
import { KubeApi } from "../kube-api";
import { KubeJsonApiData } from "../kube-json-api";

export interface ResourceQuotaValues {
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

interface MatchExpression {
  operator: string;
  scopeName: string;
  values: string[];
}

export class ResourceQuota extends KubeObject {
  static kind = "ResourceQuota"

  constructor(data: KubeJsonApiData) {
    super(data);
    this.spec = this.spec || {} as any;
  }

  spec: {
    hard: ResourceQuotaValues;
    scopeSelector?: {
      matchExpressions: MatchExpression[];
    };
  }

  status: {
    hard: ResourceQuotaValues;
    used: ResourceQuotaValues;
  }

  getScopeSelector(): MatchExpression[] {
    return this.spec?.scopeSelector?.matchExpressions;
  }
}

export const resourceQuotaApi = new KubeApi({
  kind: ResourceQuota.kind,
  apiBase: "/api/v1/resourcequotas",
  isNamespaced: true,
  objectConstructor: ResourceQuota,
});
