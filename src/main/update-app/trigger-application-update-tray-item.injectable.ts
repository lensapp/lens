/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";
import { trayMenuItemInjectionToken } from "../tray/tray-menu-item/tray-menu-item-injection-token";
import updateIsAvailableInjectable from "./update-is-available.injectable";
import triggerApplicationUpdateInjectable from "./trigger-application-update.injectable";

const triggerApplicationUpdateTrayItemInjectable = getInjectable({
  id: "trigger-application-update-tray-item",

  instantiate: (di) => {
    const updateIsAvailable = di.inject(updateIsAvailableInjectable);
    const triggerApplicationUpdate = di.inject(triggerApplicationUpdateInjectable);

    return {
      id: "trigger-application-update",
      parentId: null,
      orderNumber: 50,
      label: "Trigger update",
      enabled: computed(() => true),
      visible: computed(() => updateIsAvailable.get()),

      click:  () => {
        triggerApplicationUpdate();
      },
    };
  },

  injectionToken: trayMenuItemInjectionToken,
});

export default triggerApplicationUpdateTrayItemInjectable;
