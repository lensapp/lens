/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getRequestChannelListenerInjectable } from "../../../../common/utils/channel/request-channel-listener-injection-token";
import { deleteClusterChannel } from "../common/delete-channel";
import deleteClusterHandlerInjectable from "./delete-cluster-handler.injectable";

const deleteClusterChannelListenerInjectable = getRequestChannelListenerInjectable({
  channel: deleteClusterChannel,
  handlerInjectable: deleteClusterHandlerInjectable,
});

export default deleteClusterChannelListenerInjectable;
