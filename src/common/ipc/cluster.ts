/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

export const clusterSetFrameIdHandler = "cluster:set-frame-id";
export const clusterVisibilityHandler = "cluster:visibility";
export const clusterRefreshHandler = "cluster:refresh";
export const clusterDisconnectHandler = "cluster:disconnect";
export const clusterDeleteHandler = "cluster:delete";
export const clusterSetDeletingHandler = "cluster:deleting:set";
export const clusterClearDeletingHandler = "cluster:deleting:clear";
export const clusterKubectlApplyAllHandler = "cluster:kubectl-apply-all";
export const clusterKubectlDeleteAllHandler = "cluster:kubectl-delete-all";
export const clusterStates = "cluster:states";

/**
 * This channel is broadcast on whenever the cluster fails to list namespaces
 * during a refresh and no `accessibleNamespaces` have been set.
 */
export const clusterListNamespaceForbiddenChannel = "cluster:list-namespace-forbidden";

export type ListNamespaceForbiddenArgs = [clusterId: string];

export function isListNamespaceForbiddenArgs(args: unknown[]): args is ListNamespaceForbiddenArgs {
  return args.length === 1 && typeof args[0] === "string";
}
