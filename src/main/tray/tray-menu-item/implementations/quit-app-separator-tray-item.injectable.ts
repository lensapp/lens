/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { trayMenuItemInjectionToken } from "../tray-menu-item-injection-token";
import { computed } from "mobx";

const quitAppSeparatorTrayItemInjectable = getInjectable({
  id: "quit-app-separator-tray-item",

  instantiate: () => ({
    id: "quit-app-separator",
    parentId: null,
    orderNumber: 149,
    enabled: computed(() => true),
    visible: computed(() => true),
    separator: true,
  }),

  injectionToken: trayMenuItemInjectionToken,
});

export default quitAppSeparatorTrayItemInjectable;
