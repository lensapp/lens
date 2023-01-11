/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

/**
 * This type is used for KubeObjectStores
 */
export interface ClusterContext {
  readonly allNamespaces: string[]; // available / allowed namespaces from cluster.ts
  readonly contextNamespaces: string[]; // selected by user (see: namespace-select.tsx)
  readonly hasSelectedAll: boolean;

  isLoadingAll(namespaces: string[]): boolean;
  isGlobalWatchEnabled(): boolean;
}
