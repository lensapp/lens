/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getRequestChannelListenerInjectable } from "../../../../common/utils/channel/request-channel-listener-injection-token";
import { setClusterAsDeletingChannel } from "../common/set-as-deleting-channel";
import setClusterAsDeletingHandlerInjectable from "./set-as-deleting-handler.injectable";

const setClusterAsDeletingChannelHandlerInjectable = getRequestChannelListenerInjectable({
  channel: setClusterAsDeletingChannel,
  handlerInjectable: setClusterAsDeletingHandlerInjectable,
});

export default setClusterAsDeletingChannelHandlerInjectable;
