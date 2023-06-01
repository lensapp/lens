export interface ClusterContext {
  readonly allNamespaces: string[]; // available / allowed namespaces from cluster.ts
  readonly contextNamespaces: string[]; // selected by user (see: namespace-select.tsx)
  readonly hasSelectedAll: boolean;

  isLoadingAll(namespaces: string[]): boolean;
  isGlobalWatchEnabled(): boolean;
}
