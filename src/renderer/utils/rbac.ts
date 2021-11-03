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

import { apiResourceRecord, KubeResource } from "../../common/rbac";

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
