/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { syncBoxInitialValueChannel } from "../../../common/utils/sync-box/channels";
import { getRequestChannelListenerInjectable } from "../../../common/utils/channel/request-channel-listener-injection-token";
import syncBoxInitialValueChannelHandlerInjectable from "./sync-box-initial-value-handler.injectable";

const syncBoxInitialValueChannelListenerInjectable = getRequestChannelListenerInjectable({
  channel: syncBoxInitialValueChannel,
  handlerInjectable: syncBoxInitialValueChannelHandlerInjectable,
});

export default syncBoxInitialValueChannelListenerInjectable;
