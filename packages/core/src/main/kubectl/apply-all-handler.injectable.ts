/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import emitAppEventInjectable from "../../common/app-event-bus/emit-event.injectable";
import { kubectlApplyAllChannel } from "../../common/kube-helpers/channels";
import getClusterByIdInjectable from "../../features/cluster/storage/common/get-by-id.injectable";
import resourceApplierInjectable from "../resource-applier/create-resource-applier.injectable";
import { getRequestChannelListenerInjectable } from "@k8slens/messaging";

const kubectlApplyAllChannelHandlerInjectable = getRequestChannelListenerInjectable({
  id: "kubectl-apply-all-channel-handler-listener",
  channel: kubectlApplyAllChannel,
  getHandler: (di) => {
    const getClusterById = di.inject(getClusterByIdInjectable);
    const emitAppEvent = di.inject(emitAppEventInjectable);

    return async (event) => {
      const {
        clusterId,
        extraArgs,
        resources,
      } = event;
      const cluster = getClusterById(clusterId);

      emitAppEvent({ name: "cluster", action: "kubectl-apply-all" });

      if (!cluster) {
        return {
          callWasSuccessful: false,
          error: `No cluster found for clusterId="${clusterId}"`,
        };
      }

      const resourceApplier = di.inject(resourceApplierInjectable, cluster);

      return resourceApplier.kubectlApplyAll(resources, extraArgs);
    };
  },
});

export default kubectlApplyAllChannelHandlerInjectable;
