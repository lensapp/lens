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
    return this.cluster?.allowedNamespaces ?? [];
  },

  get contextNamespaces(): string[] {
    return namespaceStore.contextNamespaces ?? [];
  },
};
