/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { beforeFrameStartsSecondInjectionToken } from "../../before-frame-starts/tokens";
import { syncBoxInitialValueChannel } from "../../../common/utils/sync-box/channels";
import createSyncBoxStateInjectable from "../../../common/utils/sync-box/sync-box-state.injectable";
import { requestFromChannelInjectionToken } from "@k8slens/messaging";
import { runInAction } from "mobx";
import { syncBoxInjectionToken } from "../../../common/utils/sync-box/sync-box-injection-token";
import assert from "assert";

const provideInitialValuesForSyncBoxesInjectable = getInjectable({
  id: "provide-initial-values-for-sync-boxes",

  instantiate: (di) => ({
    run: async () => {
      const requestFromChannel = di.inject(requestFromChannelInjectionToken);
      const syncBoxes = di.injectMany(syncBoxInjectionToken);
      const initialValues = await requestFromChannel(syncBoxInitialValueChannel);

      runInAction(() => {
        for (const { id, value } of initialValues) {
          const syncBox = syncBoxes.find((box) => box.id === id);

          assert(syncBox);
          di.inject(createSyncBoxStateInjectable, syncBox.id).set(value);
        }
      });
    },
  }),

  injectionToken: beforeFrameStartsSecondInjectionToken,
});

export default provideInitialValuesForSyncBoxesInjectable;
