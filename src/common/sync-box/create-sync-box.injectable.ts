/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";
import syncBoxChannelInjectable from "./sync-box-channel.injectable";
import { sendToChannelInjectionToken } from "../channel/send-to-channel-injection-token";
import syncBoxStateInjectable from "./sync-box-state.injectable";
import type { SyncBox } from "./sync-box-injection-token";

const createSyncBoxInjectable = getInjectable({
  id: "create-sync-box",

  instantiate: (di) => {
    const syncBoxChannel = di.inject(syncBoxChannelInjectable);
    const sendToChannel = di.inject(sendToChannelInjectionToken);
    const getSyncBoxState = (id: string) => di.inject(syncBoxStateInjectable, id);

    return <TData>(id: string): SyncBox<TData> => {
      const state = getSyncBoxState(id);

      return {
        id,

        value: computed(() => state.get()),

        set: (value) => {
          state.set(value);

          sendToChannel(syncBoxChannel, { id, value });
        },
      };
    };
  },
});

export default createSyncBoxInjectable;

