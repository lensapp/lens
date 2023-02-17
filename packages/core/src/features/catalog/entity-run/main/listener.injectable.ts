/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getMessageChannelListenerInjectable } from "../../../../common/utils/channel/message-channel-listener-injection-token";
import { sendMessageToChannelInjectionToken } from "../../../../common/utils/channel/message-to-channel-injection-token";
import { runCatalogEntityChannel, runCatalogEntityMainFrameChannel } from "../common/channels";

const entityRunListenerInjectable = getMessageChannelListenerInjectable({
  channel: runCatalogEntityChannel,
  id: "main",
  handler: (di) => {
    const sendMessageToChannel = di.inject(sendMessageToChannelInjectionToken);

    return (id) => sendMessageToChannel(runCatalogEntityMainFrameChannel, id);
  },
});

export default entityRunListenerInjectable;
