/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { ApplicationUpdateStatusChannelMessage } from "../../../common/application-update/application-update-status-channel.injectable";
import { sendToAgnosticChannelInjectionToken } from "../../../common/channel/send-to-agnostic-channel-injection-token";
import applicationUpdateStatusChannelInjectable from "../../../common/application-update/application-update-status-channel.injectable";

const broadcastChangeInUpdatingStatusInjectable = getInjectable({
  id: "broadcast-change-in-updating-status",

  instantiate: (di) => {
    const sendToAgnosticChannel = di.inject(sendToAgnosticChannelInjectionToken);
    const applicationUpdateStatusChannel = di.inject(applicationUpdateStatusChannelInjectable);

    return (data: ApplicationUpdateStatusChannelMessage) => {
      sendToAgnosticChannel(applicationUpdateStatusChannel, data);
    };
  },
});

export default broadcastChangeInUpdatingStatusInjectable;
