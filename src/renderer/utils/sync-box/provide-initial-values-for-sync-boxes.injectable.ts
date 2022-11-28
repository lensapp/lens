/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { beforeFrameStartsInjectionToken } from "../../before-frame-starts/before-frame-starts-injection-token";
import { syncBoxInitialValueChannel } from "../../../common/utils/sync-box/channels";
import createSyncBoxStateInjectable from "../../../common/utils/sync-box/sync-box-state.injectable";
import { requestFromChannelInjectionToken } from "../../../common/utils/channel/request-from-channel-injection-token";
import { runInAction } from "mobx";
import type { SyncBox } from "../../../common/utils/sync-box/sync-box-injection-token";
import { syncBoxInjectionToken } from "../../../common/utils/sync-box/sync-box-injection-token";
import assert from "assert";

const provideInitialValuesForSyncBoxesInjectable = getInjectable({
  id: "provide-initial-values-for-sync-boxes",

  instantiate: (di) => {
    const requestFromChannel = di.inject(requestFromChannelInjectionToken);

    const syncBoxes = di.injectMany(syncBoxInjectionToken);

    const setSyncBoxState = (syncBox: SyncBox<any>, state: any) =>
      di.inject(createSyncBoxStateInjectable, syncBox.id).set(state);

    return {
      id: "provide-initial-values-for-sync-boxes",
      run: async () => {
        const initialValues = await requestFromChannel(syncBoxInitialValueChannel);

        runInAction(() => {
          initialValues.forEach(({ id, value }) => {
            const syncBox = syncBoxes.find((box) => box.id === id);

            assert(syncBox);

            setSyncBoxState(syncBox, value);
          });
        });
      },
    };
  },

  injectionToken: beforeFrameStartsInjectionToken,
});

export default provideInitialValuesForSyncBoxesInjectable;
