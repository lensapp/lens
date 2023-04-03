/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import emitAppEventInjectable from "../../../../common/app-event-bus/emit-event.injectable";
import clusterFramesInjectable from "../../../../common/cluster-frames.injectable";
import directoryForLensLocalStorageInjectable from "../../../../common/directory-for-lens-local-storage/directory-for-lens-local-storage.injectable";
import removePathInjectable from "../../../../common/fs/remove.injectable";
import joinPathsInjectable from "../../../../common/path/join-paths.injectable";
import clusterConnectionInjectable from "../../../../main/cluster/cluster-connection.injectable";
import { noop } from "@k8slens/utilities";
import { getRequestChannelListenerInjectable } from "@k8slens/messaging";
import { deleteClusterChannel } from "../common/delete-channel";
import clustersStateInjectable from "../../storage/common/state.injectable";

const deleteClusterChannelListenerInjectable = getRequestChannelListenerInjectable({
  id: "delete-cluster-channel-listener",
  channel: deleteClusterChannel,
  getHandler: (di) => {
    const emitAppEvent = di.inject(emitAppEventInjectable);
    const clusterFrames = di.inject(clusterFramesInjectable);
    const joinPaths = di.inject(joinPathsInjectable);
    const directoryForLensLocalStorage = di.inject(directoryForLensLocalStorageInjectable);
    const deleteFile = di.inject(removePathInjectable);
    const clustersState = di.inject(clustersStateInjectable);

    return async (clusterId) => {
      emitAppEvent({ name: "cluster", action: "remove" });

      const cluster = clustersState.get(clusterId);

      if (!cluster) {
        return;
      }

      const clusterConnection = di.inject(clusterConnectionInjectable, cluster);

      clusterConnection.disconnect();
      clusterFrames.delete(cluster.id);
      clustersState.delete(cluster.id);

      // remove the local storage file
      const localStorageFilePath = joinPaths(directoryForLensLocalStorage, `${cluster.id}.json`);

      await deleteFile(localStorageFilePath).catch(noop);
    };
  },
});

export default deleteClusterChannelListenerInjectable;
