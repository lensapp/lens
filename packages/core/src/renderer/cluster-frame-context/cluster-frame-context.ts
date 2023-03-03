/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

/**
 * This type is used for KubeObjectStores
 */
export interface ClusterContext {
  /**
   * A computed getter for all the namespaces that this cluster knows about
   */
  readonly allNamespaces: string[];

  /**
   * The computed getter of namespaces that are currently selected
   */
  readonly contextNamespaces: string[];

  readonly hasSelectedAll: boolean;

  isLoadingAll(namespaces: string[]): boolean;
  isGlobalWatchEnabled(): boolean;
}

export interface NamespaceScopedClusterContext extends ClusterContext {
  selectAllNamespaces(): void;
  toggleNamespace(namespace: string): void;
  selectNamespace(namespace: string): void;
  deselectNamespace(namespace: string): void;
}
