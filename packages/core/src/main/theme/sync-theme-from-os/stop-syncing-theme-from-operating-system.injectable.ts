/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import syncThemeFromOperatingSystemInjectable from "../../electron-app/features/sync-theme-from-operating-system.injectable";
import { beforeQuitOfBackEndInjectionToken } from "../../start-main-application/runnable-tokens/phases";

const stopSyncingThemeFromOperatingSystemInjectable = getInjectable({
  id: "stop-syncing-theme-from-operating-system",

  instantiate: (di) => ({
    run: () => {
      const syncTheme = di.inject(syncThemeFromOperatingSystemInjectable);

      syncTheme.stop();

      return undefined;
    },
  }),

  injectionToken: beforeQuitOfBackEndInjectionToken,
});

export default stopSyncingThemeFromOperatingSystemInjectable;
