import { getHostedCluster } from "./cluster-store";

export type KubeResource =
  "namespaces" | "nodes" | "events" | "resourcequotas" | "services" | "limitranges" |
  "secrets" | "configmaps" | "ingresses" | "networkpolicies" | "persistentvolumeclaims" | "persistentvolumes" | "storageclasses" |
  "pods" | "daemonsets" | "deployments" | "statefulsets" | "replicasets" | "jobs" | "cronjobs" |
  "endpoints" | "customresourcedefinitions" | "horizontalpodautoscalers" | "podsecuritypolicies" | "poddisruptionbudgets" |
  "role" | "rolebinding" | "clusterrolebinding" | "serviceaccount";

export interface KubeApiResource extends KubeApiResourceData {
  apiName: KubeResource; // valid api resource name (e.g. "namespaces")
}

export interface KubeApiResourceData {
  kind: string; // resource type (e.g. "Namespace")
  group?: string; // api-group
}

export const apiResources: Record<KubeResource, KubeApiResourceData> = {
  "clusterrolebinding": { kind: "ClusterRoleBinding", group: "rbac.authorization.k8s.io" },
  "configmaps": { kind: "ConfigMap" },
  "cronjobs": { kind: "CronJob", group: "batch" },
  "customresourcedefinitions": { kind: "CustomResourceDefinition", group: "apiextensions.k8s.io" },
  "daemonsets": { kind: "DaemonSet", group: "apps" },
  "deployments": { kind: "Deployment", group: "apps" },
  "endpoints": { kind: "Endpoint" },
  "events": { kind: "Event" },
  "horizontalpodautoscalers": { kind: "HorizontalPodAutoscaler" },
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
  "podsecuritypolicies": { kind: "PodSecurityPolicy" },
  "resourcequotas": { kind: "ResourceQuota" },
  "replicasets": { kind: "ReplicaSet", group: "apps" },
  "role": { kind: "Role", group: "rbac.authorization.k8s.io" },
  "rolebinding": { kind: "RoleBinding", group: "rbac.authorization.k8s.io" },
  "secrets": { kind: "Secret" },
  "serviceaccount": { kind: "ServicAccount", group: "core" },
  "services": { kind: "Service" },
  "statefulsets": { kind: "StatefulSet", group: "apps" },
  "storageclasses": { kind: "StorageClass", group: "storage.k8s.io" },
};

// TODO: auto-populate all resources dynamically (see: kubectl api-resources -o=wide -v=7)
export const apiResourceList: KubeApiResource[] = Object.entries(apiResources)
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
