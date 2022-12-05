/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { reaction } from "mobx";
import { currentClusterMessageChannel } from "../../../common/cluster/current-cluster-channel";
import { sendMessageToChannelInjectionToken } from "../../../common/utils/channel/message-to-channel-injection-token";
import matchedClusterIdInjectable from "../../navigation/matched-cluster-id.injectable";
import { evenBeforeMainFrameStartsInjectionToken } from "../tokens";

const setupCurrentClusterBroadcastInjectable = getInjectable({
  id: "setup-current-cluster-broadcast",
  instantiate: (di) => {
    const matchedClusterId = di.inject(matchedClusterIdInjectable);
    const sendMessageToChannel = di.inject(sendMessageToChannelInjectionToken);

    return {
      id: "setup-current-cluster-broadcast",
      run: () => {
        reaction(
          () => matchedClusterId.get(),
          clusterId => sendMessageToChannel(currentClusterMessageChannel, clusterId),
          {
            fireImmediately: true,
          },
        );
      },
    };
  },
  injectionToken: evenBeforeMainFrameStartsInjectionToken,
});

export default setupCurrentClusterBroadcastInjectable;
