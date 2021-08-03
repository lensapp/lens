import type { Cluster } from "../../main/cluster";
import { ApiManager } from "../api/api-manager";
import { Namespace } from "../api/endpoints";

export function allNamespaces(cluster: Cluster | null): string[] {
  if (!cluster) {
    return [];
  }

  // user given list of namespaces
  if (cluster?.accessibleNamespaces.length) {
    return cluster.accessibleNamespaces;
  }

  const namespaceStore = ApiManager.getInstance().getStore(Namespace.apiBase);

  if (namespaceStore.items.length > 0) {
    // namespaces from kubernetes api
    return namespaceStore.items.map((namespace) => namespace.getName());
  } else {
    // fallback to cluster resolved namespaces because we could not load list
    return cluster.allowedNamespaces || [];
  }
}

export function contextNamespaces(): string[] {
  // TODO: will remove when refactoring this sort of thing
  return (ApiManager.getInstance().getStore(Namespace.apiBase) as any).contextNamespaces ?? [];
}

export function isLoadingAll(cluster: Cluster, namespaces: string[]): boolean {
  const allNs = allNamespaces(cluster);

  return allNs.length > 1
    && cluster.accessibleNamespaces.length === 0
    && allNs.every(ns => namespaces.includes(ns));
}
