/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { beforeElectronIsReadyInjectionToken } from "@k8slens/application-for-electron-main";
import { getInjectable } from "@ogre-tools/injectable";
import autoUpdaterInjectable from "./auto-updater.injectable";
import isAutoUpdatingInjectable from "./is-auto-updating.injectable";

const setupTrackingOfAutoUpdatingInjectable = getInjectable({
  id: "setup-tracking-of-auto-updating",
  instantiate: (di) => ({
    run: () => {
      const autoUpdater = di.inject(autoUpdaterInjectable);
      const isAutoUpdating = di.inject(isAutoUpdatingInjectable);

      autoUpdater.once("before-quit-for-update", () => {
        isAutoUpdating.setAsUpdating();
      });

      return undefined;
    },
  }),
  injectionToken: beforeElectronIsReadyInjectionToken,
});

export default setupTrackingOfAutoUpdatingInjectable;
