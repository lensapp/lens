/**
 * This channel is broadcast on whenever the cluster fails to list namespaces
 * during a refresh and no `accessibleNamespaces` have been set.
 */
export const ClusterListNamespaceForbiddenChannel = "cluster:list-namespace-forbidden";

export type ListNamespaceFordiddenArgs = [clusterId: string];

export function argArgsListNamespaceFordiddenArgs(args: unknown[]): args is ListNamespaceFordiddenArgs {
  return args.length === 1 && typeof args[0] === "string";
}
