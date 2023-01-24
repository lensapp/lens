/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { MessageChannelSender } from "../../../common/utils/channel/message-to-channel-injection-token";
import { sendMessageToChannelInjectionToken } from "../../../common/utils/channel/message-to-channel-injection-token";
import { shellSyncFailedChannel } from "../common/failure-channel";

const emitShellSyncFailedInjectable = getInjectable({
  id: "emit-shell-sync-failed",
  instantiate: (di): MessageChannelSender<typeof shellSyncFailedChannel> => {
    const sendMessageToChannel = di.inject(sendMessageToChannelInjectionToken);

    return (error) => sendMessageToChannel(shellSyncFailedChannel, error);
  },
});

export default emitShellSyncFailedInjectable;
