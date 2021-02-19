import type { Cluster } from "../../main/cluster";
import { getHostedCluster } from "../../common/cluster-store";
import { namespaceStore } from "./+namespaces/namespace.store";

export class ClusterContext {
  get cluster(): Cluster | null {
    return getHostedCluster() ?? null;
  }

  get allNamespaces(): string[] {
    if (!this.cluster) {
      return [];
    }

    // user given list of namespaces
    if (this.cluster?.accessibleNamespaces.length) {
      return this.cluster.accessibleNamespaces;
    }

    if (namespaceStore.items.length > 0) {
      // namespaces from kubernetes api
      return namespaceStore.items.map((namespace) => namespace.getName());
    } else {
      // fallback to cluster resolved namespaces because we could not load list
      return this.cluster.allowedNamespaces || [];
    }
  }

  /**
   * This function returns true if the list of namespaces provided is the
   * same as all the namespaces that exist (for certain) on the cluster
   * @param namespaces The list of namespaces to check
   */
  public isAllPossibleNamespaces(namespaceList: string[], isFilterSelect = false): boolean {
    const namespaces = new Set(namespaceList);

    return this.allNamespaces.length > 1
      && this.cluster.accessibleNamespaces.length === 0
      && (
        (isFilterSelect && namespaces.size === 0)
        || this.allNamespaces.every(ns => namespaces.has(ns))
      );
  }

  get selectedNamespaces(): string[] {
    return namespaceStore.selectedNamespaces ?? [];
  }
}
