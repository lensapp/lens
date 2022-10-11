/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getRequestChannelListenerInjectable } from "../../../../common/utils/channel/request-channel-listener-injection-token";
import { clearClusterAsDeletingChannel } from "../common/clear-as-deleting-channel";
import clearClusterAsDeletingHandlerInjectable from "./clear-as-deleting-handler.injectable";

const clearClusterAsDeletingChannelListenerInjectable = getRequestChannelListenerInjectable({
  channel: clearClusterAsDeletingChannel,
  handlerInjectable: clearClusterAsDeletingHandlerInjectable,
});

export default clearClusterAsDeletingChannelListenerInjectable;
