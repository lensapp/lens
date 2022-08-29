/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getRequestChannelListenerInjectable } from "../../common/utils/channel/request-channel-listener-injection-token";
import { appPathsChannel } from "../../common/app-paths/app-paths-channel";
import appPathsChannelHandlerInjectable from "./app-paths-channel-handler.injectable";

const appPathsRequestChannelListenerInjectable = getRequestChannelListenerInjectable({
  channel: appPathsChannel,
  handlerInjectable: appPathsChannelHandlerInjectable,
});

export default appPathsRequestChannelListenerInjectable;
