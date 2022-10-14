/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import assert from "assert";
import hostedClusterIdInjectable from "../../../renderer/cluster-frame-context/hosted-cluster-id.injectable";
import requestFromChannelInjectable from "../../../renderer/utils/channel/request-from-channel.injectable";
import { shellApiAuthChannel } from "../common/shell-api-auth-channel";

export type RequestShellApiToken = (tabId: string) => Promise<Uint8Array>;

const requestShellApiTokenInjectable = getInjectable({
  id: "request-shell-api-token",
  instantiate: (di): RequestShellApiToken => {
    const hostedClusterId = di.inject(hostedClusterIdInjectable);
    const requestChannel = di.inject(requestFromChannelInjectable);

    return (tabId) => {
      assert(hostedClusterId, "Can only request shell access within a cluster frame");

      return requestChannel(shellApiAuthChannel, {
        clusterId: hostedClusterId,
        tabId,
      });
    };
  },
});

export default requestShellApiTokenInjectable;
