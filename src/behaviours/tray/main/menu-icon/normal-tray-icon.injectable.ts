/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";
import { trayIconInjectionToken } from "./tray-icon-injection-token";
import getTrayIconPathInjectable from "./get-tray-icon-path.injectable";

const normalTrayIconInjectable = getInjectable({
  id: "normal-icon",

  instantiate: (di) => {
    const getTrayIconPath = di.inject(getTrayIconPathInjectable);

    return {
      iconPath: getTrayIconPath(""),
      priority: 999,
      shouldBeShown: computed(() => true),
    };
  },

  injectionToken: trayIconInjectionToken,
});

export default normalTrayIconInjectable;
