/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";
import showApplicationWindowInjectable from "../../../start-main-application/lens-window/show-application-window.injectable";
import checkForUpdatesInjectable from "../../../check-for-updates.injectable";
import isAutoUpdateEnabledInjectable from "../../../update-app/is-auto-update-enabled.injectable";
import { trayMenuItemInjectionToken } from "../tray-menu-item-injection-token";

const checkForUpdatesTrayItemInjectable = getInjectable({
  id: "check-for-updates-tray-item",

  instantiate: (di) => {
    const showApplicationWindow = di.inject(showApplicationWindowInjectable);
    const checkForUpdates = di.inject(checkForUpdatesInjectable);
    const isAutoUpdateEnabled = di.inject(isAutoUpdateEnabledInjectable);

    return {
      id: "check-for-updates",
      parentId: null,
      orderNumber: 30,
      label: "Check for updates",
      enabled: computed(() => true),
      visible: computed(() => isAutoUpdateEnabled()),

      click: async () => {
        await checkForUpdates();

        await showApplicationWindow();
      },
    };
  },

  injectionToken: trayMenuItemInjectionToken,
});

export default checkForUpdatesTrayItemInjectable;
