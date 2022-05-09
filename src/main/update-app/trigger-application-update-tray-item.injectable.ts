/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";
import { trayMenuItemInjectionToken } from "../tray/tray-menu-item/tray-menu-item-injection-token";
import updateIsReadyToBeInstalledInjectable from "./update-is-ready-to-be-installed.injectable";
import quitAndInstallUpdateInjectable from "../electron-app/features/quit-and-install-update.injectable";

const triggerApplicationUpdateTrayItemInjectable = getInjectable({
  id: "trigger-application-update-tray-item",

  instantiate: (di) => {
    const updateIsReadyToBeInstalled = di.inject(updateIsReadyToBeInstalledInjectable);
    const quitAndInstallUpdate = di.inject(quitAndInstallUpdateInjectable);

    return {
      id: "trigger-application-update",
      parentId: null,
      orderNumber: 50,
      label: "Trigger update",
      enabled: computed(() => true),
      visible: computed(() => updateIsReadyToBeInstalled.get()),

      click:  () => {
        quitAndInstallUpdate();
      },
    };
  },

  injectionToken: trayMenuItemInjectionToken,
});

export default triggerApplicationUpdateTrayItemInjectable;
