/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getMessageChannelListenerInjectable } from "../../../../common/utils/channel/message-channel-listener-injection-token";
import { reloadPageChannel } from "../common/channel";
import reloadPageHandlerInjectable from "./handler.injectable";

const reloadPageChannelListenerInjectable = getMessageChannelListenerInjectable({
  channel: reloadPageChannel,
  handlerInjectable: reloadPageHandlerInjectable,
});

export default reloadPageChannelListenerInjectable;
