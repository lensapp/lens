/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { beforeFrameStartsInjectionToken } from "../../before-frame-starts/before-frame-starts-injection-token";
import syncBoxInitialValueChannelInjectable from "../../../common/utils/sync-box/sync-box-initial-value-channel.injectable";
import syncBoxStateInjectable from "../../../common/utils/sync-box/sync-box-state.injectable";
import { requestFromChannelInjectionToken } from "../../../common/utils/channel/request-from-channel-injection-token";

const provideInitialValuesForSyncBoxesInjectable = getInjectable({
  id: "provide-initial-values-for-sync-boxes",

  instantiate: (di) => {
    const requestFromChannel = di.inject(requestFromChannelInjectionToken);
    const syncBoxInitialValueChannel = di.inject(syncBoxInitialValueChannelInjectable);
    const setSyncBoxState = (id: string, state: any) => di.inject(syncBoxStateInjectable, id).set(state);

    return {
      run: async () => {
        const initialValues = await requestFromChannel(syncBoxInitialValueChannel);

        initialValues.forEach(({ id, value }) => {
          setSyncBoxState(id, value);
        });
      },
    };
  },

  injectionToken: beforeFrameStartsInjectionToken,
});

export default provideInitialValuesForSyncBoxesInjectable;
