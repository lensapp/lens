import { getHostedCluster } from "./cluster-store";

export type KubeResource =
  "namespaces" | "nodes" | "events" | "resourcequotas" | "services" | "limitranges" |
  "secrets" | "configmaps" | "ingresses" | "networkpolicies" | "persistentvolumeclaims" | "persistentvolumes" | "storageclasses" |
  "pods" | "daemonsets" | "deployments" | "statefulsets" | "replicasets" | "jobs" | "cronjobs" |
  "endpoints" | "customresourcedefinitions" | "horizontalpodautoscalers" | "podsecuritypolicies" | "poddisruptionbudgets";

export interface KubeApiResource {
  kind: string; // resource type
  resource: KubeResource; // valid resource name
  group?: string; // api-group
}

// TODO: auto-populate all resources dynamically (see: kubectl api-resources -o=wide -v=7)
export const apiResources: KubeApiResource[] = [
  { kind: "ConfigMap", resource: "configmaps" },
  { kind: "CronJob", resource: "cronjobs", group: "batch" },
  { kind: "CustomResourceDefinition", resource: "customresourcedefinitions", group: "apiextensions.k8s.io" },
  { kind: "DaemonSet", resource: "daemonsets", group: "apps" },
  { kind: "Deployment", resource: "deployments", group: "apps" },
  { kind: "Endpoint", resource: "endpoints" },
  { kind: "Event", resource: "events" },
  { kind: "HorizontalPodAutoscaler", resource: "horizontalpodautoscalers" },
  { kind: "Ingress", resource: "ingresses", group: "networking.k8s.io" },
  { kind: "Job", resource: "jobs", group: "batch" },
  { kind: "Namespace", resource: "namespaces" },
  { kind: "LimitRange", resource: "limitranges" },
  { kind: "NetworkPolicy", resource: "networkpolicies", group: "networking.k8s.io" },
  { kind: "Node", resource: "nodes" },
  { kind: "PersistentVolume", resource: "persistentvolumes" },
  { kind: "PersistentVolumeClaim", resource: "persistentvolumeclaims" },
  { kind: "Pod", resource: "pods" },
  { kind: "PodDisruptionBudget", resource: "poddisruptionbudgets" },
  { kind: "PodSecurityPolicy", resource: "podsecuritypolicies" },
  { kind: "ResourceQuota", resource: "resourcequotas" },
  { kind: "ReplicaSet", resource: "replicasets", group: "apps" },
  { kind: "Secret", resource: "secrets" },
  { kind: "Service", resource: "services" },
  { kind: "StatefulSet", resource: "statefulsets", group: "apps" },
  { kind: "StorageClass", resource: "storageclasses", group: "storage.k8s.io" },
];

export function isAllowedResourceType(kind: string): boolean {
  const apiResource = apiResources.find(resource => resource.kind === kind);

  if (apiResource) {
    return getHostedCluster().allowedResources.includes(apiResource.resource);
  }

  return true; // allowed by default for other resources
}

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
