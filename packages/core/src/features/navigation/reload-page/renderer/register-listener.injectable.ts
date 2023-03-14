/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getMessageChannelListenerInjectable } from "@k8slens/messaging";
import { reloadPageChannel } from "../common/channel";

const reloadPageChannelListenerInjectable = getMessageChannelListenerInjectable({
  id: "handler",
  channel: reloadPageChannel,
  getHandler: () => () => location.reload(),
  causesSideEffects: true,
});

export default reloadPageChannelListenerInjectable;
