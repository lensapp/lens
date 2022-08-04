/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";
import { trayMenuItemInjectionToken } from "../../../tray/tray-menu-item/tray-menu-item-injection-token";
import createApplicationWindowInjectable from "./create-application-window.injectable";
import getRandomIdInjectable from "../../../../common/utils/get-random-id.injectable";

const openNewApplicationWindowTrayMenuItemInjectable = getInjectable({
  id: "open-new-application-window-tray-menu-item",

  instantiate: (di) => {
    const getRandomId = di.inject(getRandomIdInjectable);
    const createApplicationWindow = di.inject(createApplicationWindowInjectable);

    return {
      id: "open-new-application-window",
      parentId: null,
      orderNumber: 1,
      enabled: computed(() => true),
      visible: computed(() => true),
      label: computed(() => "Open new window"),

      click: async () => {
        const id = getRandomId();

        const window = createApplicationWindow(id);

        await window.start();
      },
    };
  },

  injectionToken: trayMenuItemInjectionToken,
});

export default openNewApplicationWindowTrayMenuItemInjectable;
