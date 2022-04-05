/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { IComputedValue } from "mobx";
import { action, computed,  observable } from "mobx";
import type { ClusterId, KubeAuthUpdate } from "../../../common/cluster-types";
import loggerInjectable from "../../../common/logger.injectable";
import { getOrInsert, hasTypedProperty, isBoolean, isObject, isString } from "../../utils";
import initClusterStatusWatcherInjectable from "./cluster-status-watcher.injectable";

export interface ClusterConnectionStatus {
  readonly authOutput: IComputedValue<KubeAuthUpdate[]>;
  readonly hasErrorOutput: IComputedValue<boolean>;
  readonly isReconnecting: IComputedValue<boolean>;
  resetAuthOutput(): void;
  setAsReconnecting(): void;
  clearReconnectingState(): void;
  appendAuthUpdate(update: unknown): void;
}

export interface ClusterConnectionStatusState {
  forCluster(clusterId: ClusterId): Readonly<ClusterConnectionStatus>;
}

const clusterConnectionStatusStateInjectable = getInjectable({
  id: "cluster-connection-status-state",
  instantiate: (di) => {
    const authOutputs = observable.map<ClusterId, KubeAuthUpdate[]>();
    const reconnecting = observable.set<ClusterId>();
    const initWatcher = di.inject(initClusterStatusWatcherInjectable);
    const logger = di.inject(loggerInjectable);

    const state: ClusterConnectionStatusState = {
      forCluster: (clusterId) => {
        const authOutput = computed(() => authOutputs.get(clusterId) ?? []);

        return {
          authOutput,
          isReconnecting: computed(() => reconnecting.has(clusterId)),
          hasErrorOutput: computed(() => authOutput.get().some(output => output.isError)),
          resetAuthOutput: action(() => {
            authOutputs.delete(clusterId);
          }),
          setAsReconnecting: action(() => {
            reconnecting.add(clusterId);
          }),
          clearReconnectingState: action(() => {
            reconnecting.delete(clusterId);
          }),
          appendAuthUpdate: action((update) => {
            if (
              isObject(update)
              && hasTypedProperty(update, "message", isString)
              && hasTypedProperty(update, "isError", isBoolean)
            ) {
              getOrInsert(authOutputs, clusterId, []).push(update);
            } else {
              logger.warn(`[CLUSTER]: invalid connection update`, { update, clusterId });
            }
          }),
        };
      },
    };

    initWatcher(state);

    return state;
  },
});

export default clusterConnectionStatusStateInjectable;
