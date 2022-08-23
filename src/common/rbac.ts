/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

export type KubeResource =
  "namespaces" | "nodes" | "events" | "resourcequotas" | "services" | "limitranges" |
  "secrets" | "configmaps" | "ingresses" | "networkpolicies" | "persistentvolumeclaims" | "persistentvolumes" | "storageclasses" |
  "pods" | "daemonsets" | "deployments" | "statefulsets" | "replicasets" | "jobs" | "cronjobs" |
  "endpoints" | "customresourcedefinitions" | "horizontalpodautoscalers" | "podsecuritypolicies" | "poddisruptionbudgets" | "priorityclasses" |
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
  "priorityclasses": { kind: "PriorityClass", group: "scheduling.k8s.io" },
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
