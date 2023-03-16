/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import emitAppEventInjectable from "../../common/app-event-bus/emit-event.injectable";
import { kubectlDeleteAllChannel } from "../../common/kube-helpers/channels";
import getClusterByIdInjectable from "../../features/cluster/storage/common/get-by-id.injectable";
import resourceApplierInjectable from "../resource-applier/create-resource-applier.injectable";
import { getRequestChannelListenerInjectable } from "@k8slens/messaging";

const kubectlDeleteAllChannelHandlerInjectable = getRequestChannelListenerInjectable({
  id: "kubectl-delete-all-channel-handler-listener",
  channel: kubectlDeleteAllChannel,
  getHandler: (di) => {
    const emitAppEvent = di.inject(emitAppEventInjectable);
    const getClusterById = di.inject(getClusterByIdInjectable);

    return async (event) => {
      const {
        clusterId,
        extraArgs,
        resources,
      } = event;
      const cluster = getClusterById(clusterId);

      emitAppEvent({ name: "cluster", action: "kubectl-delete-all" });

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
