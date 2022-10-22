/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { MessageChannelHandler } from "../channel/message-channel-listener-injection-token";
import type { SyncBoxChannel } from "./channels";
import syncBoxStateInjectable from "./sync-box-state.injectable";

const syncBoxChannelHandlerInjectable = getInjectable({
  id: "sync-box-channel-handler",
  instantiate: (di): MessageChannelHandler<SyncBoxChannel> => {
    const getSyncBoxState = (id: string) => di.inject(syncBoxStateInjectable, id);

    return ({ id, value }) => getSyncBoxState(id)?.set(value);
  },
});

export default syncBoxChannelHandlerInjectable;
