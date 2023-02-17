/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { ChannelRequester } from "../../../../common/utils/channel/request-from-channel-injection-token";
import requestFromChannelInjectable from "../../../../renderer/utils/channel/request-from-channel.injectable";
import { setClusterFrameIdChannel } from "../common/channel";

export type RequestSetClusterFrameId = ChannelRequester<typeof setClusterFrameIdChannel>;

const requestSetClusterFrameIdInjectable = getInjectable({
  id: "request-set-cluster-frame-id",
  instantiate: (di): RequestSetClusterFrameId => {
    const requestFromChannel = di.inject(requestFromChannelInjectable);

    return (clusterId) => requestFromChannel(setClusterFrameIdChannel, clusterId);
  },
});

export default requestSetClusterFrameIdInjectable;
