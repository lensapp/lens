/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import emitAppEventInjectable from "../../common/app-event-bus/emit-event.injectable";
import getClusterByIdInjectable from "../../common/cluster-store/get-by-id.injectable";
import { kubectlDeleteAllChannel } from "../../common/kube-helpers/channels";
import resourceApplierInjectable from "../resource-applier/create-resource-applier.injectable";
import { getRequestChannelListenerInjectable } from "@k8slens/messaging";

const kubectlDeleteAllChannelHandlerInjectable = getRequestChannelListenerInjectable({
  id: "kubectl-delete-all-channel-handler-listener",
  channel: kubectlDeleteAllChannel,
  getHandler: (di) => {
    const emitAppEvent = di.inject(emitAppEventInjectable);
    const getClusterById = di.inject(getClusterByIdInjectable);

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

      const resourceApplier = di.inject(resourceApplierInjectable, cluster);

      return resourceApplier.kubectlDeleteAll(resources, extraArgs);
    };
  },
});

export default kubectlDeleteAllChannelHandlerInjectable;
