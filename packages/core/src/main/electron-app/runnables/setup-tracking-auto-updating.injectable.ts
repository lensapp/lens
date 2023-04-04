/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { beforeElectronIsReadyInjectionToken } from "@k8slens/application-for-electron-main";
import { getInjectable } from "@ogre-tools/injectable";
import autoUpdaterInjectable from "../features/auto-updater.injectable";
import isAutoUpdatingInjectable from "../features/is-auto-updating.injectable";

const setupTrackingAutoUpdatingInjectable = getInjectable({
  id: "setup-tracking-auto-updating",
  instantiate: (di) => ({
    run: () => {
      const isAutoUpdating = di.inject(isAutoUpdatingInjectable);
      const autoUpdater = di.inject(autoUpdaterInjectable);

      autoUpdater.on("before-quit-for-update", () => {
        isAutoUpdating.set(true);
      });

      return undefined;
    },
  }),
  injectionToken: beforeElectronIsReadyInjectionToken,
});

export default setupTrackingAutoUpdatingInjectable;
