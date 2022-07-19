/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { KubeResource } from "../../common/rbac";
import { apiResourceRecord } from "../../common/rbac";

export const ResourceNames: Record<KubeResource, string> = {
  "namespaces": "Namespaces",
  "nodes": "Nodes",
  "events": "Events",
  "resourcequotas": "Resource Quotas",
  "services": "Services",
  "secrets": "Secrets",
  "configmaps": "Config Maps",
  "ingresses": "Ingresses",
  "networkpolicies": "Network Policies",
  "persistentvolumeclaims": "Persistent Volume Claims",
  "persistentvolumes": "Persistent Volumes",
  "storageclasses": "Storage Classes",
  "pods": "Pods",
  "daemonsets": "Daemon Sets",
  "deployments": "Deployments",
  "statefulsets": "Stateful Sets",
  "replicasets": "Replica Sets",
  "jobs": "Jobs",
  "cronjobs": "Cron Jobs",
  "endpoints": "Endpoints",
  "customresourcedefinitions": "Custom Resource Definitions",
  "horizontalpodautoscalers": "Horizontal Pod Autoscalers",
  "podsecuritypolicies": "Pod Security Policies",
  "poddisruptionbudgets": "Pod Disruption Budgets",
  "priorityclasses": "Priority Classes",
  "limitranges": "Limit Ranges",
  "roles": "Roles",
  "rolebindings": "Role Bindings",
  "clusterrolebindings": "Cluster Role Bindings",
  "clusterroles": "Cluster Roles",
  "serviceaccounts": "Service Accounts",
};

export const ResourceKindMap: Record<string, KubeResource> = Object.fromEntries(
  Object.entries(apiResourceRecord)
    .map(([resource, { kind }]) => [kind, resource as KubeResource]),
);
