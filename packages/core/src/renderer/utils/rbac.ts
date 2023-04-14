/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { KubeResource } from "../../common/rbac";
import { apiResourceRecord } from "../../common/rbac";
import { object } from "@k8slens/utilities";

export const ResourceNames: Record<KubeResource, string> = {
  "namespaces": "Namespaces",
  "nodes": "Nodes",
  "events": "Events",
  "leases": "Leases",
  "resourcequotas": "Resource Quotas",
  "services": "Services",
  "secrets": "Secrets",
  "configmaps": "Config Maps",
  "ingresses": "Ingresses",
  "ingressclasses": "Ingress Classes",
  "networkpolicies": "Network Policies",
  "persistentvolumeclaims": "Persistent Volume Claims",
  "persistentvolumes": "Persistent Volumes",
  "storageclasses": "Storage Classes",
  "pods": "Pods",
  "daemonsets": "Daemon Sets",
  "deployments": "Deployments",
  "statefulsets": "Stateful Sets",
  "replicasets": "Replica Sets",
  "replicationcontrollers": "Replication Controllers",
  "jobs": "Jobs",
  "cronjobs": "Cron Jobs",
  "endpoints": "Endpoints",
  "customresourcedefinitions": "Custom Resource Definitions",
  "horizontalpodautoscalers": "Horizontal Pod Autoscalers",
  "podsecuritypolicies": "Pod Security Policies",
  "poddisruptionbudgets": "Pod Disruption Budgets",
  "priorityclasses": "Priority Classes",
  "runtimeclasses": "Runtime Classes",
  "limitranges": "Limit Ranges",
  "roles": "Roles",
  "rolebindings": "Role Bindings",
  "clusterrolebindings": "Cluster Role Bindings",
  "clusterroles": "Cluster Roles",
  "serviceaccounts": "Service Accounts",
  "verticalpodautoscalers": "Vertical Pod Autoscalers",
  "mutatingwebhookconfigurations": "Mutating Webhook Configurations",
  "validatingwebhookconfigurations": "Validating Webhook Configurations",
};

export const ResourceKindMap = object.fromEntries(
  object.entries(apiResourceRecord)
    .map(([resource, { kind }]) => [kind, resource]),
);
