/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { broadcastNativeThemeOnUpdate } from "../../native-theme";
import { whenApplicationIsLoadingInjectionToken } from "../../start-main-application/runnable-tokens/when-application-is-loading-injection-token";

const setupOsThemeUpdatesInjectable = getInjectable({
  id: "setup-os-theme-updates",

  instantiate: () => ({
    run: () => {
      broadcastNativeThemeOnUpdate();
    },
  }),

  // Todo: remove explicit usage of IPC to get rid of this.
  causesSideEffects: true,

  injectionToken: whenApplicationIsLoadingInjectionToken,
});

export default setupOsThemeUpdatesInjectable;
