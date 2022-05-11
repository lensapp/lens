/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";
import { trayMenuItemInjectionToken } from "../tray/tray-menu-item/tray-menu-item-injection-token";
import quitAndInstallUpdateInjectable from "../electron-app/features/quit-and-install-update.injectable";
import versionUpdateInjectable from "./version-update.injectable";

const installApplicationUpdateTrayItemInjectable = getInjectable({
  id: "install-update-tray-item",

  instantiate: (di) => {
    const quitAndInstallUpdate = di.inject(quitAndInstallUpdateInjectable);
    const versionUpdate = di.inject(versionUpdateInjectable);

    return {
      id: "install-update",
      parentId: null,
      orderNumber: 50,

      label: computed(() => {
        const versionToBeInstalled = versionUpdate.discoveredVersion.get();

        return `Install update ${versionToBeInstalled}`;
      }),

      enabled: computed(() => true),

      visible: computed(
        () => versionUpdate.discoveredVersion.get() && !versionUpdate.downloading.get(),
      ),

      click: () => {
        quitAndInstallUpdate();
      },
    };
  },

  injectionToken: trayMenuItemInjectionToken,
});

export default installApplicationUpdateTrayItemInjectable;
