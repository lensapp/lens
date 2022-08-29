/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { syncBoxChannel } from "./channels";
import { getMessageChannelListenerInjectable } from "../channel/message-channel-listener-injection-token";
import syncBoxChannelHandlerInjectable from "./handler.injectable";

const syncBoxChannelListenerInjectable = getMessageChannelListenerInjectable({
  channel: syncBoxChannel,
  handlerInjectable: syncBoxChannelHandlerInjectable,
});

export default syncBoxChannelListenerInjectable;
