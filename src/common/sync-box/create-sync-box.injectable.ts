/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { IComputedValue } from "mobx";
import { computed } from "mobx";
import syncBoxChannelInjectable from "./sync-box-channel.injectable";
import { sendToAgnosticChannelInjectionToken } from "../channel/send-to-agnostic-channel-injection-token";
import syncBoxStateInjectable from "./sync-box-state.injectable";

const createSyncBoxInjectable = getInjectable({
  id: "create-sync-box",

  instantiate: (di) => {
    const syncBoxChannel = di.inject(syncBoxChannelInjectable);
    const sendToAgnosticChannel = di.inject(sendToAgnosticChannelInjectionToken);
    const getSyncBoxState = (id: string) => di.inject(syncBoxStateInjectable, id);

    return (id: string): SyncBox<any> => {
      const state = getSyncBoxState(id);

      return {
        id,

        value: computed(() => state.get()),

        set: (value) => {
          state.set(value);

          sendToAgnosticChannel(syncBoxChannel, { id, value });
        },
      };
    };
  },
});

export default createSyncBoxInjectable;


export interface SyncBox<TValue> {
  id: string;
  value: IComputedValue<TValue>;
  set: (value: TValue) => void;
}
