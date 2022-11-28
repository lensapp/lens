/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import emitAppEventInjectable from "../../common/app-event-bus/emit-event.injectable";
import getClusterByIdInjectable from "../../common/cluster-store/get-by-id.injectable";
import { kubectlDeleteAllChannel } from "../../common/kube-helpers/channels";
import createResourceApplierInjectable from "../resource-applier/create-resource-applier.injectable";
import { getRequestChannelListenerInjectable } from "../utils/channel/channel-listeners/listener-tokens";

const kubectlDeleteAllChannelHandlerInjectable = getRequestChannelListenerInjectable({
  channel: kubectlDeleteAllChannel,
  handler: (di) => {
    const emitAppEvent = di.inject(emitAppEventInjectable);
    const getClusterById = di.inject(getClusterByIdInjectable);
    const createResourceApplier = di.inject(createResourceApplierInjectable);

    return async ({
      clusterId,
      extraArgs,
      resources,
    }) => {
      emitAppEvent({ name: "cluster", action: "kubectl-delete-all" });

      const cluster = getClusterById(clusterId);

      if (!cluster) {
        return {
          callWasSuccessful: false,
          error: `No cluster found for clusterId="${clusterId}"`,
        };
      }

      return createResourceApplier(cluster).kubectlDeleteAll(resources, extraArgs);
    };
  },
});

export default kubectlDeleteAllChannelHandlerInjectable;
