/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import synchronizeUpdateIsAvailableStateInjectable from "./synchronize-update-is-available-state.injectable";
import { beforeQuitOfBackEndInjectionToken } from "../../../start-main-application/runnable-tokens/before-quit-of-back-end-injection-token";

const stopSynchronizingUpdateIsAvailableStateInjectable = getInjectable({
  id: "stop-synchronizing-update-is-available-state",

  instantiate: (di) => {
    const synchronizeUpdateIsAvailableState = di.inject(synchronizeUpdateIsAvailableStateInjectable);

    return {
      run: () => {
        synchronizeUpdateIsAvailableState.stop();
      },
    };
  },

  injectionToken: beforeQuitOfBackEndInjectionToken,
});

export default stopSynchronizingUpdateIsAvailableStateInjectable;
