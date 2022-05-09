/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import synchronizeUpdateIsAvailableStateInjectable from "./synchronize-update-is-available-state.injectable";
import { onLoadOfApplicationInjectionToken } from "../../../start-main-application/runnable-tokens/on-load-of-application-injection-token";

const startSynchronizingUpdateIsAvailableStateInjectable = getInjectable({
  id: "start-synchronizing-update-is-available-state",

  instantiate: (di) => {
    const synchronizeUpdateIsAvailableState = di.inject(synchronizeUpdateIsAvailableStateInjectable);

    return {
      run: () => {
        synchronizeUpdateIsAvailableState.start();
      },
    };
  },

  injectionToken: onLoadOfApplicationInjectionToken,
});

export default startSynchronizingUpdateIsAvailableStateInjectable;
