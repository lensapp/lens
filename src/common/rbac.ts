import { getHostedCluster } from "./cluster-store";

export type KubeResource =
  "namespaces" | "nodes" | "events" | "resourcequotas" | "services" | "limitranges" |
  "secrets" | "configmaps" | "ingresses" | "networkpolicies" | "persistentvolumeclaims" | "persistentvolumes" | "storageclasses" |
  "pods" | "daemonsets" | "deployments" | "statefulsets" | "replicasets" | "jobs" | "cronjobs" |
  "endpoints" | "customresourcedefinitions" | "horizontalpodautoscalers" | "podsecuritypolicies" | "poddisruptionbudgets";

export interface KubeApiResource {
  resource: KubeResource; // valid resource name
  group?: string; // api-group
}

// TODO: auto-populate all resources dynamically (see: kubectl api-resources -o=wide -v=7)
export const apiResources: KubeApiResource[] = [
  { resource: "configmaps" },
  { resource: "cronjobs", group: "batch" },
  { resource: "customresourcedefinitions", group: "apiextensions.k8s.io" },
  { resource: "daemonsets", group: "apps" },
  { resource: "deployments", group: "apps" },
  { resource: "endpoints" },
  { resource: "events" },
  { resource: "horizontalpodautoscalers" },
  { resource: "ingresses", group: "networking.k8s.io" },
  { resource: "jobs", group: "batch" },
  { resource: "limitranges" },
  { resource: "namespaces" },
  { resource: "networkpolicies", group: "networking.k8s.io" },
  { resource: "nodes" },
  { resource: "persistentvolumes" },
  { resource: "persistentvolumeclaims" },
  { resource: "pods" },
  { resource: "poddisruptionbudgets" },
  { resource: "podsecuritypolicies" },
  { resource: "resourcequotas" },
  { resource: "replicasets", group: "apps" },
  { resource: "secrets" },
  { resource: "services" },
  { resource: "statefulsets", group: "apps" },
  { resource: "storageclasses", group: "storage.k8s.io" },
];

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
