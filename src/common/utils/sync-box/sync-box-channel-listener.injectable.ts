/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { SyncBoxChannel } from "./sync-box-channel.injectable";
import syncBoxChannelInjectable from "./sync-box-channel.injectable";
import syncBoxStateInjectable from "./sync-box-state.injectable";
import type { MessageChannelListener } from "../channel/message-channel-listener-injection-token";
import { messageChannelListenerInjectionToken } from "../channel/message-channel-listener-injection-token";

const syncBoxChannelListenerInjectable = getInjectable({
  id: "sync-box-channel-listener",

  instantiate: (di): MessageChannelListener<SyncBoxChannel> => {
    const getSyncBoxState = (id: string) => di.inject(syncBoxStateInjectable, id);
    const channel = di.inject(syncBoxChannelInjectable);

    return {
      channel,

      handler: ({ id, value }) => {
        const target = getSyncBoxState(id);

        if (target) {
          target.set(value);
        }
      },
    };
  },

  injectionToken: messageChannelListenerInjectionToken,
});

export default syncBoxChannelListenerInjectable;
