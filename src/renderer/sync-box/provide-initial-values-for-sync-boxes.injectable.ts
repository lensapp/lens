/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { beforeFrameStartsInjectionToken } from "../before-frame-starts/before-frame-starts-injection-token";
import { syncBoxInjectionToken } from "../../common/sync-box/sync-box-injection-token";
import getValueFromChannelInjectable from "../channel/get-value-from-channel.injectable";
import syncBoxInitialValueChannelInjectable from "../../common/sync-box/sync-box-initial-value-channel.injectable";
import assert from "assert";

const provideInitialValuesForSyncBoxesInjectable = getInjectable({
  id: "provide-initial-values-for-sync-boxes",

  instantiate: (di) => {
    const syncBoxes = di.injectMany(syncBoxInjectionToken);
    const getValueFromChannel = di.inject(getValueFromChannelInjectable);
    const syncBoxInitialValueChannel = di.inject(syncBoxInitialValueChannelInjectable);

    return {
      run: async () => {
        const initialValues = await getValueFromChannel(syncBoxInitialValueChannel);

        assert(initialValues);

        initialValues.forEach(({ id, value }) => {
          const targetBox = syncBoxes.find(box => box.id === id);

          if (targetBox) {
            targetBox.set(value);
          }
        });
      },
    };
  },

  injectionToken: beforeFrameStartsInjectionToken,
});

export default provideInitialValuesForSyncBoxesInjectable;
