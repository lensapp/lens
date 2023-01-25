/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { syncBoxChannel } from "./channels";
import { getMessageChannelListenerInjectable } from "../channel/message-channel-listener-injection-token";
import syncBoxStateInjectable from "./sync-box-state.injectable";

const syncBoxChannelListenerInjectable = getMessageChannelListenerInjectable({
  id: "init",
  channel: syncBoxChannel,
  handler: (di) => ({ id, value }) => di.inject(syncBoxStateInjectable, id).set(value),
});

export default syncBoxChannelListenerInjectable;
