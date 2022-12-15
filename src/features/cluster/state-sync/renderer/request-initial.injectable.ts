/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { RequestChannelHandler } from "../../../../main/utils/channel/channel-listeners/listener-tokens";
import requestFromChannelInjectable from "../../../../renderer/utils/channel/request-from-channel.injectable";
import { initialClusterStatesChannel } from "../common/channels";

export type RequestInitialClusterStates = RequestChannelHandler<typeof initialClusterStatesChannel>;

const requestInitialClusterStatesInjectable = getInjectable({
  id: "request-initial-cluster-states",
  instantiate: (di): RequestInitialClusterStates => {
    const requestFromChannel = di.inject(requestFromChannelInjectable);

    return () => requestFromChannel(initialClusterStatesChannel);
  },
});

export default requestInitialClusterStatesInjectable;
