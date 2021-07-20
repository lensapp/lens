/**
 * Copyright (c) 2021 OpenLens Authors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import { getHostedCluster } from "./cluster-store";

export type KubeResource =
  "namespaces" | "nodes" | "events" | "resourcequotas" | "services" | "limitranges" |
  "secrets" | "configmaps" | "ingresses" | "networkpolicies" | "persistentvolumeclaims" | "persistentvolumes" | "storageclasses" |
  "pods" | "daemonsets" | "deployments" | "statefulsets" | "replicasets" | "jobs" | "cronjobs" |
  "endpoints" | "customresourcedefinitions" | "horizontalpodautoscalers" | "podsecuritypolicies" | "poddisruptionbudgets" |
  "roles" | "clusterroles" | "rolebindings" | "clusterrolebindings" | "serviceaccounts";

export interface KubeApiResource extends KubeApiResourceData {
  apiName: KubeResource; // valid api resource name (e.g. "namespaces")
}

export interface KubeApiResourceData {
  kind: string; // resource type (e.g. "Namespace")
  group?: string; // api-group
}

export const apiResourceRecord: Record<KubeResource, KubeApiResourceData> = {
  "clusterroles": { kind: "ClusterRole", group: "rbac.authorization.k8s.io" },
  "clusterrolebindings": { kind: "ClusterRoleBinding", group: "rbac.authorization.k8s.io" },
  "configmaps": { kind: "ConfigMap" }, //empty group means "core"
  "cronjobs": { kind: "CronJob", group: "batch" },
  "customresourcedefinitions": { kind: "CustomResourceDefinition", group: "apiextensions.k8s.io" },
  "daemonsets": { kind: "DaemonSet", group: "apps" },
  "deployments": { kind: "Deployment", group: "apps" },
  "endpoints": { kind: "Endpoint" },
  "events": { kind: "Event" },
  "horizontalpodautoscalers": { kind: "HorizontalPodAutoscaler", group: "autoscaling" },
  "ingresses": { kind: "Ingress", group: "networking.k8s.io" },
  "jobs": { kind: "Job", group: "batch" },
  "namespaces": { kind: "Namespace" },
  "limitranges": { kind: "LimitRange" },
  "networkpolicies": { kind: "NetworkPolicy", group: "networking.k8s.io" },
  "nodes": { kind: "Node" },
  "persistentvolumes": { kind: "PersistentVolume" },
  "persistentvolumeclaims": { kind: "PersistentVolumeClaim" },
  "pods": { kind: "Pod" },
  "poddisruptionbudgets": { kind: "PodDisruptionBudget", group: "policy" },
  "podsecuritypolicies": { kind: "PodSecurityPolicy", group: "policy" },
  "resourcequotas": { kind: "ResourceQuota" },
  "replicasets": { kind: "ReplicaSet", group: "apps" },
  "roles": { kind: "Role", group: "rbac.authorization.k8s.io" },
  "rolebindings": { kind: "RoleBinding", group: "rbac.authorization.k8s.io" },
  "secrets": { kind: "Secret" },
  "serviceaccounts": { kind: "ServiceAccount" },
  "services": { kind: "Service" },
  "statefulsets": { kind: "StatefulSet", group: "apps" },
  "storageclasses": { kind: "StorageClass", group: "storage.k8s.io" },
};

// TODO: auto-populate all resources dynamically (see: kubectl api-resources -o=wide -v=7)
export const apiResources: KubeApiResource[] = Object.entries(apiResourceRecord)
  .map(([apiName, data]) => ({ apiName: apiName as KubeResource, ...data }));

export function isAllowedResource(resources: KubeResource | KubeResource[]) {
  if (!Array.isArray(resources)) {
    resources = [resources];
  }
  const { allowedResources = [] } = getHostedCluster() || {};

  for (const resource of resources) {
    if (!allowedResources.includes(resource)) {
      return false;
    }
  }

  return true;
}
