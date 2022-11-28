/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

export type KubeResource =
  "namespaces" | "nodes" | "events" | "resourcequotas" | "services" | "limitranges" | "leases" |
  "secrets" | "configmaps" | "ingresses" | "networkpolicies" | "persistentvolumeclaims" | "persistentvolumes" | "storageclasses" |
  "pods" | "daemonsets" | "deployments" | "statefulsets" | "replicasets" | "jobs" | "cronjobs" |
  "endpoints" | "customresourcedefinitions" | "horizontalpodautoscalers" | "podsecuritypolicies" | "poddisruptionbudgets" |
  "priorityclasses" | "runtimeclasses" |
  "roles" | "clusterroles" | "rolebindings" | "clusterrolebindings" | "serviceaccounts";

export interface KubeApiResource {
  kind: string;
  group?: string;
  apiName: string;
  namespaced: boolean;
}

export interface KubeApiResourceDescriptor {
  apiName: string;
  group?: string;
}

export const formatKubeApiResource = (res: KubeApiResourceDescriptor) => (
  res.group
    ? `${res.group}/${res.apiName}`
    : res.apiName
);

export interface KubeApiResourceData {
  kind: string; // resource type (e.g. "Namespace")
  group?: string; // api-group, if empty then "core"
  namespaced: boolean;
}

export const apiResourceRecord: Record<KubeResource, KubeApiResourceData> = {
  clusterroles: {
    kind: "ClusterRole",
    group: "rbac.authorization.k8s.io",
    namespaced: false,
  },
  clusterrolebindings: {
    kind: "ClusterRoleBinding",
    group: "rbac.authorization.k8s.io",
    namespaced: false,
  },
  configmaps: {
    kind: "ConfigMap",
    namespaced: true,
  },
  cronjobs: {
    kind: "CronJob",
    group: "batch",
    namespaced: true,
  },
  customresourcedefinitions: {
    kind: "CustomResourceDefinition",
    group: "apiextensions.k8s.io",
    namespaced: false,
  },
  daemonsets: {
    kind: "DaemonSet",
    group: "apps",
    namespaced: true,
  },
  deployments: {
    kind: "Deployment",
    group: "apps",
    namespaced: true,
  },
  endpoints: {
    kind: "Endpoint",
    namespaced: true,
  },
  events: {
    kind: "Event",
    namespaced: true,
  },
  horizontalpodautoscalers: {
    kind: "HorizontalPodAutoscaler",
    group: "autoscaling",
    namespaced: true,
  },
  ingresses: {
    kind: "Ingress",
    group: "networking.k8s.io",
    namespaced: true,
  },
  jobs: {
    kind: "Job",
    group: "batch",
    namespaced: true,
  },
  namespaces: {
    kind: "Namespace",
    namespaced: false,
  },
  limitranges: {
    kind: "LimitRange",
    namespaced: true,
  },
  leases: {
    kind: "Lease",
    namespaced: true,
  },
  networkpolicies: {
    kind: "NetworkPolicy",
    group: "networking.k8s.io",
    namespaced: true,
  },
  nodes: {
    kind: "Node",
    namespaced: false,
  },
  persistentvolumes: {
    kind: "PersistentVolume",
    namespaced: false,
  },
  persistentvolumeclaims: {
    kind: "PersistentVolumeClaim",
    namespaced: true,
  },
  pods: {
    kind: "Pod",
    namespaced: true,
  },
  poddisruptionbudgets: {
    kind: "PodDisruptionBudget",
    group: "policy",
    namespaced: true,
  },
  podsecuritypolicies: {
    kind: "PodSecurityPolicy",
    group: "policy",
    namespaced: false,
  },
  priorityclasses: {
    kind: "PriorityClass",
    group: "scheduling.k8s.io",
    namespaced: false,
  },
  runtimeclasses: {
    kind: "RuntimeClass",
    group: "node.k8s.io",
    namespaced: false,
  },
  resourcequotas: {
    kind: "ResourceQuota",
    namespaced: true,
  },
  replicasets: {
    kind: "ReplicaSet",
    group: "apps",
    namespaced: true,
  },
  roles: {
    kind: "Role",
    group: "rbac.authorization.k8s.io",
    namespaced: true,
  },
  rolebindings: {
    kind: "RoleBinding",
    group: "rbac.authorization.k8s.io",
    namespaced: true,
  },
  secrets: {
    kind: "Secret",
    namespaced: true,
  },
  serviceaccounts: {
    kind: "ServiceAccount",
    namespaced: true,
  },
  services: {
    kind: "Service",
    namespaced: true,
  },
  statefulsets: {
    kind: "StatefulSet",
    group: "apps",
    namespaced: true,
  },
  storageclasses: {
    kind: "StorageClass",
    group: "storage.k8s.io",
    namespaced: false,
  },
};
