/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import syncThemeFromOperatingSystemInjectable from "../../electron-app/features/sync-theme-from-operating-system.injectable";
import { onLoadOfApplicationInjectionToken } from "../../start-main-application/runnable-tokens/on-load-of-application-injection-token";

const startSyncingThemeFromOperatingSystemInjectable = getInjectable({
  id: "start-syncing-theme-from-operating-system",

  instantiate: (di) => {
    const syncTheme = di.inject(syncThemeFromOperatingSystemInjectable);

    return {
      run: async () => {
        await syncTheme.start();
      },
    };
  },

  injectionToken: onLoadOfApplicationInjectionToken,
});

export default startSyncingThemeFromOperatingSystemInjectable;
