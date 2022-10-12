/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getMessageChannelListenerInjectable } from "../../../../common/utils/channel/message-channel-listener-injection-token";
import { reloadPageChannel } from "../common/channel";

const reloadPageChannelListenerInjectable = getMessageChannelListenerInjectable({
  id: "handler",
  channel: reloadPageChannel,
  handler: () => () => location.reload(),
  causesSideEffects: true,
});

export default reloadPageChannelListenerInjectable;
