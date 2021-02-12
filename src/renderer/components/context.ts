import type { Cluster } from "../../main/cluster";
import { getHostedCluster } from "../../common/cluster-store";
import { namespaceStore } from "./+namespaces/namespace.store";

export interface ClusterContext {
  cluster?: Cluster;
  allNamespaces?: string[]; // available / allowed namespaces from cluster.ts
  contextNamespaces?: string[]; // selected by user (see: namespace-select.tsx)
}

export const clusterContext: ClusterContext = {
  get cluster(): Cluster | null {
    return getHostedCluster();
  },

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
  },

  get contextNamespaces(): string[] {
    return namespaceStore.contextNamespaces ?? [];
  },
};
