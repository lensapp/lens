import { getHostedCluster } from "./cluster-store";

export type KubeResource =
  "namespaces" | "nodes" | "events" | "resourcequotas" | "services" | "limitranges" |
  "secrets" | "configmaps" | "ingresses" | "networkpolicies" | "persistentvolumeclaims" | "persistentvolumes" | "storageclasses" |
  "pods" | "daemonsets" | "deployments" | "statefulsets" | "replicasets" | "jobs" | "cronjobs" |
  "endpoints" | "customresourcedefinitions" | "horizontalpodautoscalers" | "podsecuritypolicies" | "poddisruptionbudgets";

export interface KubeApiResource {
  kind: string; // resource type (e.g. "Namespace")
  apiName: KubeResource; // valid api resource name (e.g. "namespaces")
  group?: string; // api-group
}

// TODO: auto-populate all resources dynamically (see: kubectl api-resources -o=wide -v=7)
export const apiResources: KubeApiResource[] = [
  { kind: "ConfigMap", apiName: "configmaps" },
  { kind: "CronJob", apiName: "cronjobs", group: "batch" },
  { kind: "CustomResourceDefinition", apiName: "customresourcedefinitions", group: "apiextensions.k8s.io" },
  { kind: "DaemonSet", apiName: "daemonsets", group: "apps" },
  { kind: "Deployment", apiName: "deployments", group: "apps" },
  { kind: "Endpoint", apiName: "endpoints" },
  { kind: "Event", apiName: "events" },
  { kind: "HorizontalPodAutoscaler", apiName: "horizontalpodautoscalers" },
  { kind: "Ingress", apiName: "ingresses", group: "networking.k8s.io" },
  { kind: "Job", apiName: "jobs", group: "batch" },
  { kind: "Namespace", apiName: "namespaces" },
  { kind: "LimitRange", apiName: "limitranges" },
  { kind: "NetworkPolicy", apiName: "networkpolicies", group: "networking.k8s.io" },
  { kind: "Node", apiName: "nodes" },
  { kind: "PersistentVolume", apiName: "persistentvolumes" },
  { kind: "PersistentVolumeClaim", apiName: "persistentvolumeclaims" },
  { kind: "Pod", apiName: "pods" },
  { kind: "PodDisruptionBudget", apiName: "poddisruptionbudgets" },
  { kind: "PodSecurityPolicy", apiName: "podsecuritypolicies" },
  { kind: "ResourceQuota", apiName: "resourcequotas" },
  { kind: "ReplicaSet", apiName: "replicasets", group: "apps" },
  { kind: "Secret", apiName: "secrets" },
  { kind: "Service", apiName: "services" },
  { kind: "StatefulSet", apiName: "statefulsets", group: "apps" },
  { kind: "StorageClass", apiName: "storageclasses", group: "storage.k8s.io" },
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
