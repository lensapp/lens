/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { beforeFrameStartsSecondInjectionToken } from "../../before-frame-starts/tokens";
import { syncBoxInitialValueChannel } from "../../../common/utils/sync-box/channels";
import createSyncBoxStateInjectable from "../../../common/utils/sync-box/sync-box-state.injectable";
import { runInAction } from "mobx";
import { syncBoxInjectionToken } from "../../../common/utils/sync-box/sync-box-injection-token";
import assert from "assert";
import requestFromChannelInjectable from "../channel/request-from-channel.injectable";

const provideInitialValuesForSyncBoxesInjectable = getInjectable({
  id: "provide-initial-values-for-sync-boxes",

  instantiate: (di) => ({
    id: "provide-initial-values-for-sync-boxes",
    run: async () => {
      const requestFromChannel = di.inject(requestFromChannelInjectable);
      const syncBoxes = di.injectMany(syncBoxInjectionToken);
      const initialValues = await requestFromChannel(syncBoxInitialValueChannel);

      runInAction(() => {
        for (const { id, value } of initialValues) {
          const syncBox = syncBoxes.find((box) => box.id === id);

          assert(syncBox, `Missing synx box with id="${id}"`);
          di.inject(createSyncBoxStateInjectable, syncBox.id).set(value);
        }
      });
    },
  }),

  injectionToken: beforeFrameStartsSecondInjectionToken,
});

export default provideInitialValuesForSyncBoxesInjectable;
