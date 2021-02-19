import { IpcMainInvokeEvent } from "electron";
import { ResourceApplier } from "../../main/resource-applier";
import { clusterFrameMap } from "../cluster-frames";
import { ClusterId, clusterStore } from "../cluster-store";
import { appEventBus } from "../event-bus";
import { hasOptionalProperty, hasTypedProperty, isString, isBoolean, bindPredicate, isTypedArray } from "../utils/type-narrowing";
import { createTypedInvoker, createTypedSender } from "./type-enforced-ipc";

export type ClusterIdArgList = [clusterId: ClusterId];

function isClusterIdArgList(args: unknown[]): args is ClusterIdArgList {
  return hasTypedProperty(args, 0, isString)
    && args.length === 1;
}

/**
 * This channel is broadcast on whenever the cluster fails to list namespaces
 * during a refresh and no `accessibleNamespaces` have been set.
 */
export const clusterListNamespacesForbidden = createTypedSender({
  channel: "cluster:list-namespace-forbidden",
  verifier: isClusterIdArgList,
});

export const clusterActivate = createTypedInvoker({
  channel: "cluster:activate",
  handler(event, clusterId: ClusterId, force?: boolean) {
    return clusterStore.getById(clusterId)?.activate(force ?? false);
  },
  verifier(args: unknown[]): args is [clusterId: ClusterId, force?: boolean] {
    return hasTypedProperty(args, 0, isString)
      && hasOptionalProperty(args, 1, isBoolean)
      && args.length <= 2;
  }
});

export const clusterSetFrameId = createTypedInvoker({
  channel: "cluster:set-frame-id",
  handler({ frameId, processId }: IpcMainInvokeEvent, clusterId: ClusterId) {
    const cluster = clusterStore.getById(clusterId);

    if (cluster) {
      clusterFrameMap.set(cluster.id, { frameId, processId });

      return cluster.pushState();
    }
  },
  verifier: isClusterIdArgList,
});

export const clusterRefresh = createTypedInvoker({
  channel: "cluster:refresh",
  handler(event, clusterId: ClusterId) {
    return clusterStore.getById(clusterId)?.refresh({ refreshMetadata: true });
  },
  verifier: isClusterIdArgList,
});

export const clusterDisconnect = createTypedInvoker({
  channel: "cluster:disconnect",
  handler(event, clusterId: ClusterId) {
    appEventBus.emit({ name: "cluster", action: "stop" });
    const cluster = clusterStore.getById(clusterId);

    if (cluster) {
      cluster.disconnect();
      clusterFrameMap.delete(cluster.id);
    }
  },
  verifier: isClusterIdArgList,
});

export const clusterKubectlApplyAll = createTypedInvoker({
  channel: "cluster:kubectl-apply-all",
  handler(event, clusterId: ClusterId, resources: string[]) {
    appEventBus.emit({ name: "cluster", action: "kubectl-apply-all" });
    const cluster = clusterStore.getById(clusterId);

    if (cluster) {
      const applier = new ResourceApplier(cluster);

      applier.kubectlApplyAll(resources);
    } else {
      throw new Error(`${clusterId} is not a valid cluster id`);
    }
  },
  verifier(args: unknown[]): args is [clusterId: ClusterId, resources: string[]] {
    return hasTypedProperty(args, 0, isString)
      && hasTypedProperty(args, 1, bindPredicate(isTypedArray, isString))
      && args.length === 2;
  },
});
